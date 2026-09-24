import type { InferenceRequest, InferenceResult } from "@agent/inference/inference-runner"
import type {
	InputText,
	MessageItem,
	ModelMessageItem,
	ModelOutputItem,
	ReasoningItem,
	ToolUseRequest,
	ToolUseResult,
} from "@agent/inference/context"
import type { InferenceEndpointMapper } from "@agent/inference/inference-endpoint-mapper"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@agent/inference/token-usage"
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

		for (const item of context.items) {
			if (item.type === "message") {
				const message = item as MessageItem
				if (message.role === "developer" || message.role === "system") {
					system.push((message.content as InputText).text)
					continue
				}

				if (message.role === "user") {
					this.addContentBlock(messages, "user", { type: "text", text: (message.content as InputText).text })
					continue
				}

				if (message.role === "assistant") {
					const modelMessage = item as ModelMessageItem
					this.addContentBlock(messages, "assistant", { type: "text", text: modelMessage.content.text })
					continue
				}
			}

			if (item.type === "reasoning") {
				const reasoning = item as ReasoningItem
				this.addContentBlock(messages, "assistant", {
					type: "thinking",
					thinking: reasoning.content?.text ?? "",
					signature: reasoning.encryptedContent ?? "",
				})
				continue
			}

			if (item.type === "tool_use_request") {
				const toolUseRequest = item as ToolUseRequest
				let input: any
				try {
					input = JSON.parse(toolUseRequest.toolArguments)
				} catch {
					input = toolUseRequest.toolArguments
				}
				this.addContentBlock(messages, "assistant", {
					type: "tool_use",
					id: toolUseRequest.requestId,
					name: toolUseRequest.toolName,
					input: input,
				})
				continue
			}

			if (item.type === "tool_use_result") {
				const toolUseResult = item as ToolUseResult
				this.addContentBlock(messages, "user", {
					type: "tool_result",
					tool_use_id: toolUseResult.requestId,
					content: toolUseResult.result.text,
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
		const items: ModelOutputItem[] = []

		for (const block of response.content as any[]) {
			if (block.type === "text") {
				items.push({
					type: "message",
					role: "assistant",
					content: { type: "output_text", text: block.text },
				})
				continue
			}
			if (block.type === "tool_use") {
				items.push({
					type: "tool_use_request",
					requestId: block.id,
					toolName: block.name,
					toolArguments: JSON.stringify(block.input ?? {}),
				})
				continue
			}
			if (block.type === "thinking") {
				items.push({
					type: "reasoning",
					content: block.thinking ? { type: "input_text", text: block.thinking } : undefined,
					encryptedContent: block.signature,
					summary: [],
				})
			}
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
