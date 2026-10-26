import type { InferenceRequest } from "@inference/inference-request"
import type { InferenceResult } from "@inference/inference-result"
import type { InferenceEndpointMapper } from "@inference/inference-endpoint-mapper"
import type { ModelOutputItem, ToolCallRequest, ToolCallResult } from "@inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@inference/token-usage"

export class OpenAIChatCompletionsMapper implements InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest) {
		const request: any = {
			model: inferenceRequest.model,
			messages: this.mapContextItems(inferenceRequest),
		}

		if (inferenceRequest.tools && inferenceRequest.tools.length > 0) {
			request.tools = inferenceRequest.tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters,
				},
			}))
		}

		if (inferenceRequest.reasoningEffort) {
			request.reasoning_effort = inferenceRequest.reasoningEffort
		}

		if (inferenceRequest.streaming) {
			request.stream = inferenceRequest.streaming
		}

		return request
	}

	mapContextItems(inferenceRequest: InferenceRequest): any[] {
		const messages: any[] = []

		for (const item of inferenceRequest.context.items) {
			if (item.type === "developer_message" || item.type === "system_message") {
				messages.push({ role: "system", content: item.text })
				continue
			}

			if (item.type === "user_message") {
				messages.push({ role: "user", content: item.text })
				continue
			}

			if (item.type === "model_message") {
				messages.push({ role: "assistant", content: item.text })
				continue
			}

			if (item.type === "tool_call_request") {
				const toolCallRequest = item as ToolCallRequest
				const toolCall = {
					id: toolCallRequest.requestId,
					type: "function",
					function: { name: toolCallRequest.toolName, arguments: toolCallRequest.toolArguments },
				}
				const last = messages[messages.length - 1]
				if (last?.role === "assistant") {
					last.tool_calls = last.tool_calls ?? []
					last.tool_calls.push(toolCall)
				} else {
					messages.push({ role: "assistant", content: null, tool_calls: [toolCall] })
				}
				continue
			}

			if (item.type === "tool_call_result") {
				const toolCallResult = item as ToolCallResult
				messages.push({
					role: "tool",
					tool_call_id: toolCallResult.requestId,
					content: toolCallResult.result.text,
				})
			}
		}

		return messages
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.prompt_tokens,
			response.usage.completion_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.prompt_tokens_details?.cached_tokens ?? 0),
			new OutputTokenDetails(response.usage.completion_tokens_details?.reasoning_tokens ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: ModelOutputItem[] = []
		const message = response.choices?.[0]?.message
		if (!message) {
			return { items: [], tokenUsage: this.extractTokenUsage(response), rowResponse: response }
		}

		if (message.reasoning_content) {
			items.push({
				type: "reasoning",
				content: { type: "input_text", text: message.reasoning_content },
				encryptedContent: undefined,
				summary: [],
			})
		}

		if (message.content) {
			items.push({
				type: "model_message",
				text: message.content,
			})
		}

		for (const toolCall of message.tool_calls ?? []) {
			items.push({
				type: "tool_call_request",
				requestId: toolCall.id,
				toolName: toolCall.function.name,
				toolArguments: toolCall.function.arguments,
			})
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
