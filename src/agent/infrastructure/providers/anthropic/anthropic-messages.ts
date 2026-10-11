import { SpaceEvent } from "@util/space-event"
import type { InferenceEndpoint } from "@inference/inference-endpoint"
import type { InferenceRequest } from "@inference/inference-request"
import type { InferenceResult } from "@inference/inference-result"
import { AnthropicMessagesMapper } from "@agent/infrastructure/providers/anthropic/anthropic-messages-mapper"
import Anthropic from "@anthropic-ai/sdk"
import type { InferenceEndpointMapper } from "@inference/inference-endpoint-mapper"

export interface AnthropicConnectionConfig {
	baseURL?: string
	apiKey?: string
	/** OAuth token for Claude Max / enterprise SSO (sent as `Authorization: Bearer`). */
	authToken?: string
}

/**
 * Native Anthropic adapter on the `@anthropic-ai/sdk` (`messages.create`).
 * Maps domain context to Anthropic's `messages`/`content` blocks shape,
 * system prompt, tools, adaptive thinking, and structured output config.
 */
export class AnthropicMessages implements InferenceEndpoint {
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
			authToken: this.clientConfig.authToken,
		}))
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResult> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const response = await this.client.messages.create(request)

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<SpaceEvent> {
		const request = this.endpointMapper.toRequest(inferenceRequest)
		const stream = this.client.messages.stream(request)

		for await (const event of stream) {
			yield event as unknown as SpaceEvent
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
