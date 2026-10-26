import type { InferenceRequest } from "@inference/inference-request"
import type { InferenceResult } from "@inference/inference-result"
import type { ModelOutputItem, ReasoningItem, ToolCallRequest, ToolCallResult } from "@inference/context"
import type { InferenceEndpointMapper } from "@inference/inference-endpoint-mapper"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@inference/token-usage"
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
			if (item.type === "developer_message" || item.type === "system_message") {
				system.push(item.text)
				continue
			}

			if (item.type === "user_message") {
				this.addContentBlock(messages, "user", { type: "text", text: item.text })
				continue
			}

			if (item.type === "model_message") {
				this.addContentBlock(messages, "assistant", { type: "text", text: item.text })
				continue
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

			if (item.type === "tool_call_request") {
				const toolCallRequest = item as ToolCallRequest
				let input: any
				try {
					input = JSON.parse(toolCallRequest.toolArguments)
				} catch {
					input = toolCallRequest.toolArguments
				}
				this.addContentBlock(messages, "assistant", {
					type: "tool_call_request",
					id: toolCallRequest.requestId,
					name: toolCallRequest.toolName,
					input: input,
				})
				continue
			}

			if (item.type === "tool_call_result") {
				const toolCallResult = item as ToolCallResult
				this.addContentBlock(messages, "user", {
					type: "tool_result",
					tool_call_id: toolCallResult.requestId,
					content: toolCallResult.result.text,
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
					type: "model_message",
					text: block.text,
				})
				continue
			}
			if (block.type === "tool_call") {
				items.push({
					type: "tool_call_request",
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
