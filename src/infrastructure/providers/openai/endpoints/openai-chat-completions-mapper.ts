import type { InferenceInput, InferenceItem, InferenceOutput } from "@domain/agent-loop/states/inference"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { SystemMessageItem } from "@domain/model-context/context-item/client-item/system-message"
import { UserMessageItem } from "@domain/model-context/context-item/client-item/user-message"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { InputText } from "@domain/model-context/context-item/item-content/input-text"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import type { ContextItem } from "@domain/model-context/context-item/context-item"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"

export class OpenAIChatCompletionsMapper implements InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput) {
		const request: any = {
			model: inferenceInput.model,
			messages: this.mapContextItems(inferenceInput),
		}

		if (inferenceInput.tools && inferenceInput.tools.length > 0) {
			request.tools = inferenceInput.tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters,
				},
			}))
		}

		if (inferenceInput.reasoningEffort) {
			request.reasoning_effort = inferenceInput.reasoningEffort
		}

		if (inferenceInput.streaming) {
			request.stream = inferenceInput.streaming
		}

		return request
	}

	mapContextItems(inferenceInput: InferenceInput): any[] {
		const messages: any[] = []

		for (const item of inferenceInput.context.getItems()) {
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

			if (item instanceof FunctionCallItem) {
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

			if (item instanceof FunctionCallOutputItem) {
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

	toResponse(response: any): InferenceOutput {
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
				FunctionCallItem.rehydrate({
					callId: toolCall.id,
					name: toolCall.function.name,
					args: toolCall.function.arguments,
				}),
			)
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
