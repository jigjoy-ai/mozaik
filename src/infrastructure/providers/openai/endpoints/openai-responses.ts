import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import type { InferenceOutput } from "@domain/agent-loop/states/inference"
import type { Endpoint } from "@domain/generative-model/endpoint"
import OpenAI from "openai"
import type { InferenceInput } from "@domain/agent-loop/states/inference"
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

	async infer(inferenceInput: InferenceInput): Promise<InferenceOutput> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response = await this.client.responses.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceInput: InferenceInput): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const stream: any = await this.client.responses.create({ ...request, stream: true })

		// Only the terminal `response.completed` event carries the assembled
		// response; the deltas before it cannot be mapped to an InferenceOutput.
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
			producerId: inferenceInput.model,
		}
	}
}
