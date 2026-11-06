import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const gemini35FlashLiteSpecification: ModelSpecification = {
	name: "gemini-3.5-flash-lite",
	provider: "google",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["high", "medium", "low", "minimal"],
	supportedContextItemTypes: [
		"user_message",
		"system_message",
		"developer_message",
		"reasoning",
		"function_call",
		"function_call_output",
		"model_message",
	],
	supportsStreaming: true,
	contextWindowSize: 1_048_576,
	maxOutputTokens: 65_536,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
