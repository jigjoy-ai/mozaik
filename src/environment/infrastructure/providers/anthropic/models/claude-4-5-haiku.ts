import type { ModelSpecification } from "src/inference/generative-model"

export const claudeHaiku45Specification: ModelSpecification = {
	name: "claude-haiku-4-5",
	provider: "anthropic",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["high", "medium", "low", "none"],
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
	contextWindowSize: 200_000,
	maxOutputTokens: 64_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
