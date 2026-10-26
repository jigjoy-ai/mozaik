import type { InferenceRequest } from "@inference/inference-request"
import type { InferenceResult } from "@inference/inference-result"
import type { InferenceEndpointMapper } from "@inference/inference-endpoint-mapper"
import type { ModelOutputItem, ReasoningItem, ToolCallRequest, ToolCallResult } from "@inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@inference/token-usage"
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
			if (item.type === "developer_message" || item.type === "system_message" || item.type === "user_message") {
				const role =
					item.type === "developer_message" ? "developer" : item.type === "system_message" ? "system" : "user"
				input.push({
					type: "message",
					role,
					content: [{ type: "input_text", text: item.text }],
				})
				continue
			}

			if (item.type === "model_message") {
				input.push({
					type: "message",
					role: "assistant",
					content: [{ type: "output_text", text: item.text }],
				})
				continue
			}

			if (item.type === "tool_call_request") {
				const toolCallRequest = item as ToolCallRequest
				input.push({
					type: "function_call",
					call_id: toolCallRequest.requestId,
					name: toolCallRequest.toolName,
					arguments: toolCallRequest.toolArguments,
				})
				continue
			}

			if (item.type === "tool_call_result") {
				const toolCallResult = item as ToolCallResult
				input.push({
					type: "function_call_output",
					call_id: toolCallResult.requestId,
					output: [{ type: "input_text", text: toolCallResult.result.text }],
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
						type: "model_message",
						text: firstContent.text,
					})
				}
				continue
			}
			if (item.type === "function_call") {
				const toolCallRequest: ToolCallRequest = {
					type: "tool_call_request",
					requestId: item.call_id,
					toolName: item.name,
					toolArguments: item.arguments,
				}
				items.push(toolCallRequest)
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
