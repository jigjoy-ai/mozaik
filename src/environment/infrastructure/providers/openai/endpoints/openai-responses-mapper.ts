import type { InferenceRequest, InferenceResult } from "src/inference/inference-runner"
import type { InferenceEndpointMapper } from "src/inference/inference-endpoint-mapper"
import type {
	InputText,
	MessageItem,
	ModelMessageItem,
	ModelOutputItem,
	ReasoningItem,
	ToolUseRequest,
	ToolUseResult,
} from "src/inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "src/inference/token-usage"
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

		for (const item of inferenceRequest.context.items) {
			if (item.type === "message") {
				const message = item as MessageItem
				if (message.role === "developer" || message.role === "system" || message.role === "user") {
					input.push({
						type: "message",
						role: message.role,
						content: [{ type: "input_text", text: (message.content as InputText).text }],
					})
					continue
				}

				if (message.role === "assistant") {
					const modelMessage = item as ModelMessageItem
					input.push({
						type: "message",
						role: modelMessage.role,
						content: [{ type: "output_text", text: modelMessage.content.text }],
					})
					continue
				}
			}

			if (item.type === "tool_use_request") {
				const toolUseRequest = item as ToolUseRequest
				input.push({
					type: "function_call",
					call_id: toolUseRequest.requestId,
					name: toolUseRequest.toolName,
					arguments: toolUseRequest.toolArguments,
				})
				continue
			}

			if (item.type === "tool_use_result") {
				const toolUseResult = item as ToolUseResult
				input.push({
					type: "function_call_output",
					call_id: toolUseResult.requestId,
					output: [{ type: "input_text", text: toolUseResult.result.text }],
				})
				continue
			}

			if (item.type === "reasoning") {
				const reasoning = item as ReasoningItem
				const reasoningInput: Record<string, unknown> = {
					type: "reasoning",
					summary: reasoning.summary.map((summary) => ({ type: "summary_text", text: summary.text })),
				}
				if (reasoning.encryptedContent !== undefined) {
					reasoningInput.encrypted_content = reasoning.encryptedContent
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
		const items: ModelOutputItem[] = []

		for (const item of response.output ?? []) {
			if (item.type === "message" && item.role === "assistant") {
				const firstContent = item.content?.[0]
				if (firstContent) {
					items.push({
						type: "message",
						role: "assistant",
						content: { type: "output_text", text: firstContent.text },
					})
				}
				continue
			}
			if (item.type === "function_call") {
				const toolUseRequest: ToolUseRequest = {
					type: "tool_use_request",
					requestId: item.call_id,
					toolName: item.name,
					toolArguments: item.arguments,
				}
				items.push(toolUseRequest)
				continue
			}
			if (item.type === "reasoning") {
				items.push({
					type: "reasoning",
					content: undefined,
					encryptedContent: item.encrypted_content,
					summary: (item.summary ?? []).map((summary: { text: string }) => ({
						type: "summary_text" as const,
						text: summary.text,
					})),
				})
			}
		}

		return {
			items,
			tokenUsage: this.extractTokenUsage(response),
			rowResponse: response,
		}
	}
}
