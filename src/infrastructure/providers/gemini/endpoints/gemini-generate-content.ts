import { SemanticEvent } from "@domain/environment/semantic-event/event"
import { GoogleGenAI } from "@google/genai"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceInput, InferenceOutput } from "@domain/agent/loop/states/inference"
import { GeminiGenerateContentMapper } from "./gemini-generate-content-mapper"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export interface GeminiConnectionConfig {
	baseURL?: string
	apiKey?: string
}

/**
 * Native Gemini adapter on the `@google/genai` SDK (`generateContent` /
 * `generateContentStream`). Unlike an OpenAI-compat shim this maps our
 * domain context to Gemini's native `contents`/`parts` shape, system
 * instruction, `functionDeclarations`, and `thinkingConfig`, and reads
 * thought parts + native usage metadata back out. Another `ModelRuntime`
 * — no runner or port changes.
 */
export class GeminiGenerateContent implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private _client?: GoogleGenAI
	private readonly clientConfig: GeminiConnectionConfig

	constructor(
		endpointMapper: InferenceEndpointMapper = new GeminiGenerateContentMapper(),
		config: GeminiConnectionConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.clientConfig = config
	}

	private get client(): GoogleGenAI {
		return (this._client ??= new GoogleGenAI({
			apiKey: this.clientConfig.apiKey ?? process.env.GEMINI_API_KEY,
			...(this.clientConfig.baseURL ? { httpOptions: { baseUrl: this.clientConfig.baseURL } } : {}),
		}))
	}

	async infer(inferenceInput: InferenceInput): Promise<InferenceOutput> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response = await this.client.models.generateContent(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceInput: InferenceInput): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const stream: any = await this.client.models.generateContentStream(request)

		let lastEvent: SemanticEvent | undefined = undefined
		for await (const chunk of stream) {
			lastEvent = chunk
			yield chunk
		}

		if (!lastEvent) {
			throw new Error("Last event not found")
		}

		const output = this.endpointMapper.toResponse(lastEvent)

		yield {
			type: "inference.output",
			producerId: request.model,
			occurredAt: new Date(),
			payload: output,
		}
	}
}
