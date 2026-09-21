import type { Endpoint } from "./endpoint"

export type GenerativeModel = {
	endpoint: Endpoint
	specification: ModelSpecification
}

export type ModelProviders = "openai" | "anthropic" | "gemini" | "deepseek"

export type ModelSpecification = {
	name: string
	provider: string
	supportsReasoningEffort: boolean
	supportedReasoningEfforts: string[]
	supportsStreaming: boolean
	contextWindowSize: number
	supportedContextItemTypes: string[]
	maxOutputTokens: number
	supportsFunctionCalling: boolean
	supportsStructuredOutput: boolean
}
