import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const gemini35FlashSpecification: ModelSpecification = {
	name: "gemini-3.5-flash",
	provider: "google",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["high", "medium", "low", "minimal", "none"],
	supportedContextItemTypes: [
		"user_message",
		"system_message",
		"developer_message",
		"reasoning",
		"tool_use_request",
		"tool_use_result",
		"model_message",
	],
	supportsStreaming: true,
	contextWindowSize: 1_048_576,
	maxOutputTokens: 64_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
