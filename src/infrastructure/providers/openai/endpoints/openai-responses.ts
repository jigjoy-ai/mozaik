import { RuntimeEvent } from "@domain/runtime/event"
import { InferenceRequest, InferenceResult } from "@domain/generative-model/inference-runner"
import type { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"
import { OpenAIResponsesMapper } from "./openai-responses-mapper"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export class OpenAIResponses implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private _client?: OpenAI

	constructor(endpointMapper: InferenceEndpointMapper = new OpenAIResponsesMapper()) {
		this.endpointMapper = endpointMapper
	}

	private get client(): OpenAI {
		return (this._client ??= new OpenAI())
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResult> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<RuntimeEvent> {
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
