import type { InferenceRequest, InferenceItem, InferenceResult } from "@domain/generative-model/inference-runner"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"
import { DeveloperMessageItem } from "@domain/generative-model/context/items/developer-message"
import { ToolUseResult } from "@domain/generative-model/context/items/tool-use-result"
import { SystemMessageItem } from "@domain/generative-model/context/items/system-message"
import { UserMessageItem } from "@domain/generative-model/context/items/user-message"
import { ToolUseRequest } from "@domain/generative-model/context/items/tool-use-request"
import { ModelMessageItem } from "@domain/generative-model/context/items/model-message"
import { InputText } from "@domain/generative-model/context/items/item-content/input-text"
import { ReasoningItem } from "@domain/generative-model/context/items/reasoning"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"

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

		for (const item of inferenceRequest.context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				messages.push({ role: "system", content: item.content.text })
				continue
			}

			if (item instanceof UserMessageItem) {
				messages.push({ role: "user", content: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				messages.push({ role: "assistant", content: item.content.text })
				continue
			}

			if (item instanceof ToolUseRequest) {
				const toolCall = {
					id: item.callId,
					type: "function",
					function: { name: item.name, arguments: item.args },
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

			if (item instanceof ToolUseResult) {
				messages.push({ role: "tool", tool_call_id: item.callId, content: item.output.text })
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
		const items: InferenceItem[] = []
		const message = response.choices?.[0]?.message
		if (!message) {
			return { items: [], tokenUsage: this.extractTokenUsage(response), rowResponse: response }
		}

		if (message.reasoning_content) {
			items.push(
				ReasoningItem.rehydrate({
					content: InputText.rehydrate({ text: message.reasoning_content }),
					encryptedContent: undefined,
					summary: [],
				}),
			)
		}

		if (message.content) {
			items.push(ModelMessageItem.rehydrate({ text: message.content }))
		}

		for (const toolCall of message.tool_calls ?? []) {
			items.push(
				ToolUseRequest.rehydrate({
					callId: toolCall.id,
					name: toolCall.function.name,
					args: toolCall.function.arguments,
				}),
			)
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
