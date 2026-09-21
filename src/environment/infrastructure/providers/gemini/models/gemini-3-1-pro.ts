import type { ModelSpecification } from "src/inference/generative-model"

export const gemini31ProSpecification: ModelSpecification = {
	name: "gemini-3.1-pro-preview",
	provider: "google",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["high", "medium", "low", "minimal", "none"],
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
	maxOutputTokens: 64_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
