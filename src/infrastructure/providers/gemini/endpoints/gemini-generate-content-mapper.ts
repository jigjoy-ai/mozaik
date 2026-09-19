import type { InferenceInput, InferenceItem, InferenceOutput } from "@domain/agent/loop/states/inference"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@domain/generative-model/token-usage"
import { DeveloperMessageItem } from "@domain/generative-model/context/items/developer-message"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { SystemMessageItem } from "@domain/generative-model/context/items/system-message"
import { UserMessageItem } from "@domain/generative-model/context/items/user-message"
import { InputText } from "@domain/generative-model/context/items/item-content/input-text"
import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"
import { ModelMessageItem } from "@domain/generative-model/context/items/model-message"
import { ReasoningItem } from "@domain/generative-model/context/items/reasoning"

export class GeminiGenerateContentMapper implements InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput) {
		const { contents, systemInstruction } = this.mapContextItems(inferenceInput)
		const config: any = {}

		if (systemInstruction) {
			config.systemInstruction = systemInstruction
		}

		if (inferenceInput.tools && inferenceInput.tools.length > 0) {
			config.tools = [
				{
					functionDeclarations: inferenceInput.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parametersJsonSchema: tool.parameters,
					})),
				},
			]
		}

		if (inferenceInput.structuredOutput) {
			config.responseMimeType = "application/json"
			config.responseSchema = inferenceInput.structuredOutput.schema
		}

		if (inferenceInput.reasoningEffort) {
			config.thinkingConfig = {
				thinkingLevel: inferenceInput.reasoningEffort,
				includeThoughts: true,
			}
		}

		const request: any = {
			model: inferenceInput.model,
			contents,
			config,
		}

		if (inferenceInput.streaming) {
			request.stream = inferenceInput.streaming
		}

		return request
	}

	mapContextItems(inferenceInput: InferenceInput): { contents: any[]; systemInstruction?: string } {
		const context = inferenceInput.context
		const contents: any[] = []
		const system: string[] = []
		const callNames = new Map<string, string>()

		for (const item of context.getItems()) {
			if (item instanceof DeveloperMessageItem || item instanceof SystemMessageItem) {
				system.push(item.content.text)
				continue
			}

			if (item instanceof UserMessageItem) {
				this.addPart(contents, "user", { text: item.content.text })
				continue
			}

			if (item instanceof ModelMessageItem) {
				this.addPart(contents, "model", { text: item.content.text })
				continue
			}

			if (item instanceof FunctionCallItem) {
				callNames.set(item.callId, item.name)
				let args: any
				try {
					args = JSON.parse(item.args)
				} catch {
					args = {}
				}
				this.addPart(contents, "model", { functionCall: { id: item.callId, name: item.name, args } })
				continue
			}

			if (item instanceof FunctionCallOutputItem) {
				this.addPart(contents, "user", {
					functionResponse: {
						id: item.callId,
						name: callNames.get(item.callId) ?? "",
						response: this.parseResponse(item.output.text),
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

	toResponse(response: any): InferenceOutput {
		const items: InferenceItem[] = []
		const parts = response.candidates?.[0]?.content?.parts ?? []

		for (const part of parts) {
			if (part.thought && part.text) {
				items.push(
					ReasoningItem.rehydrate({
						content: InputText.rehydrate({ text: part.text }),
						encryptedContent: undefined,
						summary: [],
					}),
				)
				continue
			}
			if (part.text) {
				items.push(ModelMessageItem.rehydrate({ text: part.text }))
				continue
			}
			if (part.functionCall) {
				items.push(
					FunctionCallItem.rehydrate({
						callId: part.functionCall.id ?? "",
						name: part.functionCall.name,
						args: JSON.stringify(part.functionCall.args ?? {}),
					}),
				)
			}
		}

		return { items, tokenUsage: this.extractTokenUsage(response), rowResponse: response }
	}
}
