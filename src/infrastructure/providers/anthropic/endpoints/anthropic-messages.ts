import { SemanticEvent } from "@domain/environment/semantic-event/event"
import type { Endpoint } from "@domain/generative-model/endpoint"
import type { InferenceInput, InferenceOutput } from "@domain/agent/loop/states/inference"
import { AnthropicMessagesMapper } from "./anthropic-messages-mapper"
import Anthropic from "@anthropic-ai/sdk"
import type { InferenceEndpointMapper } from "@domain/generative-model/inference-endpoint-mapper"

export interface AnthropicConnectionConfig {
	baseURL?: string
	apiKey?: string
}

/**
 * Native Anthropic adapter on the `@anthropic-ai/sdk` (`messages.create`).
 * Maps domain context to Anthropic's `messages`/`content` blocks shape,
 * system prompt, tools, adaptive thinking, and structured output config.
 */
export class AnthropicMessages implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private _client?: Anthropic
	private readonly clientConfig: AnthropicConnectionConfig

	constructor(
		endpointMapper: InferenceEndpointMapper = new AnthropicMessagesMapper(),
		config: AnthropicConnectionConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.clientConfig = config
	}

	private get client(): Anthropic {
		return (this._client ??= new Anthropic({
			baseURL: this.clientConfig.baseURL,
			apiKey: this.clientConfig.apiKey,
		}))
	}

	async infer(inferenceInput: InferenceInput): Promise<InferenceOutput> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const response = await this.client.messages.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceInput: InferenceInput): AsyncIterable<SemanticEvent> {
		const request = this.endpointMapper.toRequest(inferenceInput)
		const stream = this.client.messages.stream(request)

		for await (const event of stream) {
			yield event as unknown as SemanticEvent
		}

		const output = this.endpointMapper.toResponse(await stream.finalMessage())

		yield {
			type: "inference.output",
			producerId: request.model,
			occurredAt: new Date(),
			payload: output,
		}
	}
}
