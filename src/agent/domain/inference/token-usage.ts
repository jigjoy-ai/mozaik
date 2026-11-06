export class InputTokenDetails {
	readonly cached_tokens: number

	constructor(cached_tokens: number) {
		this.cached_tokens = cached_tokens
	}
}

export class OutputTokenDetails {
	readonly reasoning_tokens: number

	constructor(reasoning_tokens: number) {
		this.reasoning_tokens = reasoning_tokens
	}
}

export class TokenUsage {
	readonly inputTokens: number
	readonly outputTokens: number
	readonly totalTokens: number
	readonly inputTokenDetails: InputTokenDetails
	readonly outputTokenDetails: OutputTokenDetails

	constructor(
		inputTokens: number,
		outputTokens: number,
		totalTokens: number,
		inputTokenDetails: InputTokenDetails,
		outputTokenDetails: OutputTokenDetails,
	) {
		this.inputTokens = inputTokens
		this.outputTokens = outputTokens
		this.totalTokens = totalTokens
		this.inputTokenDetails = inputTokenDetails
		this.outputTokenDetails = outputTokenDetails
	}
}
