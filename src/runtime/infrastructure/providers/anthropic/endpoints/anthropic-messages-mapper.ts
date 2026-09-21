import type { InferenceRequest, InferenceItem, InferenceResult } from "src/inference/inference-runner"
import { DeveloperMessageItem } from "src/inference/context/items/developer-message"
import { ToolUseResult } from "src/inference/context/items/tool-use-result"
import { SystemMessageItem } from "src/inference/context/items/system-message"
import { UserMessageItem } from "src/inference/context/items/user-message"
import { ToolUseRequest } from "src/inference/context/items/tool-use-request"
import { ModelMessageItem } from "src/inference/context/items/model-message"
import type { InferenceEndpointMapper } from "src/inference/inference-endpoint-mapper"
import { ReasoningItem } from "src/inference/context/items/reasoning"
import { InputText } from "src/inference/context/items/item-content/input-text"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "src/inference/token-usage"
import type Anthropic from "@anthropic-ai/sdk"

export class AnthropicMessagesMapper implements InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest) {
		const { messages, system } = this.mapContextItems(inferenceRequest)
		const outputConfig: any = {}

		const request: any = {
			model: inferenceRequest.model,
			messages,
		}

		request.max_tokens = inferenceRequest.maxOutputTokens!

		if (system) {
			request.system = system
		}

		if (inferenceRequest.tools && inferenceRequest.tools.length > 0) {
			request.tools = inferenceRequest.tools.map((tool) => ({
				name: tool.name,
				description: tool.description,
				input_schema: tool.parameters,
			}))
		}

		if (inferenceRequest.structuredOutput) {
			outputConfig.format = {
				type: "json_schema",
				schema: inferenceRequest.structuredOutput.schema,
			}
		}

		if (inferenceRequest.reasoningEffort) {
			request.thinking = { type: "adaptive" }
			outputConfig.effort = inferenceRequest.reasoningEffort
		}

		if (Object.keys(outputConfig).length > 0) {
			request.output_config = outputConfig
		}

		if (inferenceRequest.streaming) {
			request.stream = inferenceRequest.streaming
		}

		return request
	}

	private addContentBlock(messages: any[], role: "user" | "assistant", block: any): void {
		const lastMessage = messages[messages.length - 1]
		if (lastMessage?.role === role) {
			lastMessage.content.push(block)
			return
		}

		messages.push({
			role: role,
			content: [block],
		})
	}

	mapContextItems(inferenceRequest: InferenceRequest): { messages: any[]; system?: string } {
		const context = inferenceRequest.context
		const messages: any[] = []
		const system: string[] = []

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				system.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				this.addContentBlock(messages, "user", { type: "text", text: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				this.addContentBlock(messages, "assistant", { type: "text", text: item.content.text })
				continue
			}

			if (item instanceof ReasoningItem) {
				this.addContentBlock(messages, "assistant", {
					type: "thinking",
					thinking: item.content?.text ?? "",
					signature: item.encryptedContent ?? "",
				})
				continue
			}

			if (item instanceof ToolUseRequest) {
				let input: any
				try {
					input = JSON.parse(item.args)
				} catch {
					input = item.args
				}
				this.addContentBlock(messages, "assistant", {
					type: "tool_use",
					id: item.callId,
					name: item.name,
					input: input,
				})
				continue
			}

			if (item instanceof ToolUseResult) {
				this.addContentBlock(messages, "user", {
					type: "tool_result",
					tool_use_id: item.callId,
					content: item.output.text,
				})
			}
		}

		return {
			messages: messages,
			system: system.length > 0 ? system.join("\n\n") : undefined,
		}
	}

	extractTokenUsage(response: Anthropic.Messages.Message): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.input_tokens,
			response.usage.output_tokens,
			response.usage.input_tokens + response.usage.output_tokens,
			new InputTokenDetails(
				(response.usage.cache_creation_input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0),
			),
			new OutputTokenDetails(0),
		)
	}

	toResponse(response: Anthropic.Messages.Message): InferenceResult {
		const items: InferenceItem[] = []

		for (const block of response.content as any[]) {
			if (block.type === "text") {
				items.push(ModelMessageItem.rehydrate({ text: block.text }))
				continue
			}
			if (block.type === "tool_use") {
				items.push(
					ToolUseRequest.rehydrate({
						callId: block.id,
						name: block.name,
						args: JSON.stringify(block.input ?? {}),
					}),
				)
				continue
			}
			if (block.type === "thinking") {
				items.push(
					ReasoningItem.rehydrate({
						content: block.thinking ? InputText.rehydrate({ text: block.thinking }) : undefined,
						encryptedContent: block.signature,
						summary: [],
					}),
				)
			}
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
