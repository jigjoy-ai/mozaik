import { SpaceEvent } from "@util/space-event"
import { InferenceRequest } from "@agent/domain/inference/inference-request"
import { InferenceResult } from "@agent/domain/inference/inference-result"
import type { InferenceEndpoint } from "@agent/domain/inference/inference-endpoint"
import { OpenAIResponsesMapper } from "@agent/infrastructure/providers/openai/openai-responses-mapper"
import type { InferenceEndpointMapper } from "@agent/domain/inference/inference-endpoint-mapper"
import OpenAI from "openai"

/**
 * Optional connection config. When omitted, the `openai` SDK reads
 * `OPENAI_API_KEY` and `OPENAI_BASE_URL` from the environment.
 */
export interface OpenAIResponsesConfig {
	baseURL?: string
	apiKey?: string
}

export class OpenAIResponses implements InferenceEndpoint {
	endpointMapper: InferenceEndpointMapper
	private _client?: OpenAI
	private readonly clientConfig: OpenAIResponsesConfig

	constructor(
		endpointMapper: InferenceEndpointMapper = new OpenAIResponsesMapper(),
		config: OpenAIResponsesConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.clientConfig = config
	}

	private get client(): OpenAI {
		// Passing `undefined` for baseURL/apiKey lets the SDK fall back
		// to OPENAI_BASE_URL / OPENAI_API_KEY from the environment.
		return (this._client ??= new OpenAI({
			baseURL: this.clientConfig.baseURL,
			apiKey: this.clientConfig.apiKey,
		}))
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResult> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<SpaceEvent> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const stream: any = await this.client.responses.create({ ...request, stream: true })

		// Only the terminal `response.completed` event carries the assembled
		// response; the deltas before it cannot be mapped to an InferenceResult.
		let completedResponse: any = undefined
		for await (const event of stream) {
			if (event.type === "response.completed") {
				completedResponse = event.response
			}

			yield event
		}

		if (!completedResponse) {
			throw new Error("Stream ended without a completed response")
		}

		const output = this.endpointMapper.toResponse(completedResponse)

		yield {
			type: "inference.output",
			payload: output,
			occurredAt: new Date(),
			producerId: inferenceRequest.model,
		}
	}
}
