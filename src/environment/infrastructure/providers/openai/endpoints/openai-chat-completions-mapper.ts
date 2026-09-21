import type { InferenceRequest, InferenceResult } from "src/inference/inference-runner"
import type { InferenceEndpointMapper } from "src/inference/inference-endpoint-mapper"
import type {
	InputText,
	MessageItem,
	ModelMessageItem,
	ModelOutputItem,
	ToolUseRequest,
	ToolUseResult,
} from "src/inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "src/inference/token-usage"

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
			if (item.type === "message") {
				const message = item as MessageItem
				if (message.role === "developer" || message.role === "system") {
					messages.push({ role: "system", content: (message.content as InputText).text })
					continue
				}

				if (message.role === "user") {
					messages.push({ role: "user", content: (message.content as InputText).text })
					continue
				}

				if (message.role === "assistant") {
					const modelMessage = item as ModelMessageItem
					messages.push({ role: "assistant", content: modelMessage.content.text })
					continue
				}
			}

			if (item.type === "tool_use_request") {
				const toolUseRequest = item as ToolUseRequest
				const toolCall = {
					id: toolUseRequest.requestId,
					type: "function",
					function: { name: toolUseRequest.toolName, arguments: toolUseRequest.toolArguments },
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

			if (item.type === "tool_use_result") {
				const toolUseResult = item as ToolUseResult
				messages.push({ role: "tool", tool_call_id: toolUseResult.requestId, content: toolUseResult.result.text })
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
				type: "message",
				role: "assistant",
				content: { type: "output_text", text: message.content },
			})
		}

		for (const toolCall of message.tool_calls ?? []) {
			items.push({
				type: "tool_use_request",
				requestId: toolCall.id,
				toolName: toolCall.function.name,
				toolArguments: toolCall.function.arguments,
			})
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
