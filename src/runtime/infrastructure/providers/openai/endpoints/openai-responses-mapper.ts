import { InferenceRequest, InferenceItem, InferenceResult } from "src/runtime/domain/generative-model/inference-runner"
import type { InferenceEndpointMapper } from "src/runtime/domain/generative-model/inference-endpoint-mapper"
import { DeveloperMessageItem } from "src/runtime/domain/generative-model/context/items/developer-message"
import { ToolUseResult } from "src/runtime/domain/generative-model/context/items/tool-use-result"
import { SystemMessageItem } from "src/runtime/domain/generative-model/context/items/system-message"
import { UserMessageItem } from "src/runtime/domain/generative-model/context/items/user-message"
import { ToolUseRequest } from "src/runtime/domain/generative-model/context/items/tool-use-request"
import { ModelMessageItem } from "src/runtime/domain/generative-model/context/items/model-message"
import { ReasoningItem } from "src/runtime/domain/generative-model/context/items/reasoning"
import { SummaryText } from "src/runtime/domain/generative-model/context/items/item-content/summary-text"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "src/runtime/domain/generative-model/token-usage"
import type OpenAI from "openai"

export class OpenAIResponsesMapper implements InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any {
		const request: any = {
			model: inferenceRequest.model,
			input: this.mapContextItems(inferenceRequest),
		}

		if (inferenceRequest.tools && inferenceRequest.tools.length > 0) {
			request.tools = inferenceRequest.tools.map((tool) => ({
				type: tool.type,
				name: tool.name,
				description: tool.description,
				parameters: tool.parameters,
			}))
		}

		if (inferenceRequest.reasoningEffort) {
			request.reasoning = {
				effort: inferenceRequest.reasoningEffort,
			}
		}

		if (inferenceRequest.structuredOutput) {
			const format = inferenceRequest.structuredOutput
			request.text = {
				format: {
					type: "json_schema",
					name: format.name ?? "response",
					schema: format.schema,
					strict: format.strict ?? true,
				},
			}
		}

		if (inferenceRequest.streaming) {
			request.stream = inferenceRequest.streaming
		}

		return request
	}

	mapContextItems(inferenceRequest: InferenceRequest): any[] {
		const input: any[] = []

		for (const item of inferenceRequest.context.getItems()) {
			if (
				item instanceof DeveloperMessageItem ||
				item instanceof SystemMessageItem ||
				item instanceof UserMessageItem
			) {
				input.push({
					type: item.type,
					role: item.role,
					content: [{ type: "input_text", text: item.content.text }],
				})
				continue
			}

			if (item instanceof ModelMessageItem) {
				input.push({
					type: item.type,
					role: item.role,
					content: [{ type: "output_text", text: item.content.text }],
				})
				continue
			}

			if (item instanceof ToolUseRequest) {
				input.push({
					type: item.type,
					call_id: item.callId,
					name: item.name,
					arguments: item.args,
				})
				continue
			}

			if (item instanceof ToolUseResult) {
				input.push({
					type: item.type,
					call_id: item.callId,
					output: [{ type: "input_text", text: item.output.text }],
				})
				continue
			}

			if (item instanceof ReasoningItem) {
				const reasoningInput: Record<string, unknown> = {
					type: item.type,
					summary: item.summary.map((summary) => ({ type: "summary_text", text: summary.text })),
				}
				if (item.encryptedContent !== undefined) {
					reasoningInput.encrypted_content = item.encryptedContent
				}
				input.push(reasoningInput)
			}
		}

		return input
	}

	extractTokenUsage(response: OpenAI.Responses.Response): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.input_tokens,
			response.usage.output_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.input_tokens_details?.cached_tokens ?? 0),
			new OutputTokenDetails(response.usage.output_tokens_details?.reasoning_tokens ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: InferenceItem[] = []

		for (const item of response.output ?? []) {
			if (item.type === "message" && item.role === "assistant") {
				const firstContent = item.content?.[0]
				if (firstContent) {
					items.push(ModelMessageItem.rehydrate(firstContent as { text: string }))
				}
				continue
			}
			if (item.type === "function_call") {
				items.push(
					ToolUseRequest.rehydrate({
						callId: item.call_id,
						name: item.name,
						args: item.arguments,
					}),
				)
				continue
			}
			if (item.type === "reasoning") {
				items.push(
					ReasoningItem.rehydrate({
						content: undefined,
						encryptedContent: item.encrypted_content,
						summary: (item.summary ?? []).map((summary: { text: string }) =>
							SummaryText.rehydrate({ text: summary.text }),
						),
					}),
				)
			}
		}

		return {
			items,
			tokenUsage: this.extractTokenUsage(response),
			rowResponse: response,
		}
	}
}
