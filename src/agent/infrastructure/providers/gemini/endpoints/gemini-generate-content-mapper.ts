import type { InferenceRequest, InferenceResult } from "@agent/inference/inference-runner"
import type { InferenceEndpointMapper } from "@agent/inference/inference-endpoint-mapper"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@agent/inference/token-usage"
import type {
	InputText,
	MessageItem,
	ModelMessageItem,
	ModelOutputItem,
	ToolUseRequest,
	ToolUseResult,
} from "@agent/inference/context"

export class GeminiGenerateContentMapper implements InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest) {
		const { contents, systemInstruction } = this.mapContextItems(inferenceRequest)
		const config: any = {}

		if (systemInstruction) {
			config.systemInstruction = systemInstruction
		}

		if (inferenceRequest.tools && inferenceRequest.tools.length > 0) {
			config.tools = [
				{
					functionDeclarations: inferenceRequest.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parametersJsonSchema: tool.parameters,
					})),
				},
			]
		}

		if (inferenceRequest.structuredOutput) {
			config.responseMimeType = "application/json"
			config.responseSchema = inferenceRequest.structuredOutput.schema
		}

		if (inferenceRequest.reasoningEffort) {
			config.thinkingConfig = {
				thinkingLevel: inferenceRequest.reasoningEffort,
				includeThoughts: true,
			}
		}

		const request: any = {
			model: inferenceRequest.model,
			contents,
			config,
		}

		if (inferenceRequest.streaming) {
			request.stream = inferenceRequest.streaming
		}

		return request
	}

	mapContextItems(inferenceRequest: InferenceRequest): { contents: any[]; systemInstruction?: string } {
		const context = inferenceRequest.context
		const contents: any[] = []
		const system: string[] = []
		const callNames = new Map<string, string>()

		for (const item of context.items) {
			if (item.type === "message") {
				const message = item as MessageItem
				if (message.role === "developer" || message.role === "system") {
					system.push((message.content as InputText).text)
					continue
				}

				if (message.role === "user") {
					this.addPart(contents, "user", { text: (message.content as InputText).text })
					continue
				}

				if (message.role === "assistant") {
					const modelMessage = item as ModelMessageItem
					this.addPart(contents, "model", { text: modelMessage.content.text })
					continue
				}
			}

			if (item.type === "tool_use_request") {
				const toolUseRequest = item as ToolUseRequest
				callNames.set(toolUseRequest.requestId, toolUseRequest.toolName)
				let args: any
				try {
					args = JSON.parse(toolUseRequest.toolArguments)
				} catch {
					args = {}
				}
				this.addPart(contents, "model", {
					functionCall: { id: toolUseRequest.requestId, name: toolUseRequest.toolName, args },
				})
				continue
			}

			if (item.type === "tool_use_result") {
				const toolUseResult = item as ToolUseResult
				this.addPart(contents, "user", {
					functionResponse: {
						id: toolUseResult.requestId,
						name: callNames.get(toolUseResult.requestId) ?? "",
						response: this.parseResponse(toolUseResult.result.text),
					},
				})
			}
		}

		return {
			contents,
			systemInstruction: system.length > 0 ? system.join("\n\n") : undefined,
		}
	}

	private addPart(contents: any[], role: "user" | "model", part: any): void {
		const last = contents[contents.length - 1]
		if (last?.role === role) {
			last.parts.push(part)
			return
		}

		contents.push({ role, parts: [part] })
	}

	private parseResponse(output: string): any {
		try {
			const parsed = JSON.parse(output)
			return parsed && typeof parsed === "object" ? parsed : { output }
		} catch {
			return { output }
		}
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		const usage = response.usageMetadata
		if (!usage) {
			return undefined
		}
		return new TokenUsage(
			usage.promptTokenCount ?? 0,
			usage.candidatesTokenCount ?? 0,
			usage.totalTokenCount ?? 0,
			new InputTokenDetails(usage.cachedContentTokenCount ?? 0),
			new OutputTokenDetails(usage.thoughtsTokenCount ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: ModelOutputItem[] = []
		const parts = response.candidates?.[0]?.content?.parts ?? []

		for (const part of parts) {
			if (part.thought && part.text) {
				items.push({
					type: "reasoning",
					content: { type: "input_text", text: part.text },
					encryptedContent: undefined,
					summary: [],
				})
				continue
			}
			if (part.text) {
				items.push({
					type: "message",
					role: "assistant",
					content: { type: "output_text", text: part.text },
				})
				continue
			}
			if (part.functionCall) {
				items.push({
					type: "tool_use_request",
					requestId: part.functionCall.id ?? "",
					toolName: part.functionCall.name,
					toolArguments: JSON.stringify(part.functionCall.args ?? {}),
				})
			}
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
