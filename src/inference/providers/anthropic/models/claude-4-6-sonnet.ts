import type { ModelSpecification } from "@inference/generative-model"

export const claudeSonnet46Specification: ModelSpecification = {
	name: "claude-sonnet-4-6",
	provider: "anthropic",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "high", "medium", "low"],
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
