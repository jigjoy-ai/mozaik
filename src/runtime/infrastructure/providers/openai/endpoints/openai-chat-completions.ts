import { InferenceRequest, InferenceResult } from "src/inference/inference-runner"
import { RuntimeEvent } from "src/runtime/domain/runtime/event"
import type { Endpoint } from "src/inference/endpoint"
import { OpenAIChatCompletionsMapper } from "./openai-chat-completions-mapper"
import OpenAI from "openai"
import type { InferenceEndpointMapper } from "src/inference/inference-endpoint-mapper"

/**
 * Optional connection config. When omitted, the `openai` SDK reads
 * `OPENAI_API_KEY` and `OPENAI_BASE_URL` from the environment, so the
 * default-constructed runtime targets whatever `OPENAI_BASE_URL` points
 * at (real OpenAI when unset). Provider presets (e.g. DeepSeek) pass an
 * explicit base URL + credential.
 */
export interface OpenAICompatibleConfig {
	baseURL?: string
	apiKey?: string
	/**
	 * Extra request-body fields merged into every `chat.completions`
	 * call. This is how provider-specific quirks are handled **without
	 * a per-provider subclass in mozaik** — the consumer supplies the
	 * vendor-only fields (e.g. DeepSeek's `{ thinking: { type } }`,
	 * safety flags, routing hints). Standard fields the runtime already
	 * sets (`model`, `messages`, `tools`, `reasoning_effort`) take
	 * precedence and are not overwritten.
	 */
	extraBody?: Record<string, unknown>
}

/**
 * Generic adapter for any **OpenAI Chat Completions**-compatible
 * endpoint — real OpenAI, DeepSeek, Xiaomi MiMo, OpenRouter, vLLM,
 * Ollama, etc. It speaks `/chat/completions` (not the Responses API),
 * which is the dialect third-party OpenAI-compatible providers expose.
 *
 * The base URL and credential are configurable; everything else (the
 * `ModelContext` ⇄ chat-message conversion, tool-call round-trip, token
 * usage extraction) is provider-agnostic. Provider-specific request
 * shaping (e.g. DeepSeek's `thinking` field) is supplied by the
 * consumer via {@link OpenAICompatibleConfig.extraBody} — mozaik stays
 * generic and gains no per-provider subclasses.
 *
 * Was `DeepSeekChatCompletions`; generalized so consumers can point it
 * at any OpenAI-compatible endpoint.
 */
export class OpenAIChatCompletions implements Endpoint {
	endpointMapper: InferenceEndpointMapper
	private _client?: OpenAI
	private readonly clientConfig: OpenAICompatibleConfig
	private readonly extraBody: Record<string, unknown>

	constructor(
		endpointMapper: InferenceEndpointMapper = new OpenAIChatCompletionsMapper(),
		config: OpenAICompatibleConfig = {},
	) {
		this.endpointMapper = endpointMapper
		this.clientConfig = config
		this.extraBody = config.extraBody ?? {}
	}

	private get client(): OpenAI {
		// Passing `undefined` for baseURL/apiKey lets the SDK fall back
		// to OPENAI_BASE_URL / OPENAI_API_KEY from the environment.
		return (this._client ??= new OpenAI({
			baseURL: this.clientConfig.baseURL,
			apiKey: this.clientConfig.apiKey,
		}))
	}

	private buildRequest(inferenceRequest: InferenceRequest): any {
		return {
			...this.extraBody,
			...this.endpointMapper.toRequest(inferenceRequest),
		}
	}

	async infer(inferenceRequest: InferenceRequest): Promise<InferenceResult> {
		const response = await this.client.chat.completions.create(this.buildRequest(inferenceRequest))

		return this.endpointMapper.toResponse(response)
	}

	async *stream(inferenceRequest: InferenceRequest): AsyncIterable<RuntimeEvent> {
		const stream = this.client.chat.completions.stream(this.buildRequest(inferenceRequest))

		for await (const chunk of stream) {
			yield chunk as unknown as RuntimeEvent
		}

		const output = this.endpointMapper.toResponse(await stream.finalChatCompletion())

		yield {
			type: "inference.output",
			payload: output,
			occurredAt: new Date(),
			producerId: inferenceRequest.model,
		}
	}
}
