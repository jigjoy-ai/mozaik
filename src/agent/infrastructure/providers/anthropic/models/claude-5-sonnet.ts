import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const claudeSonnet5Specification: ModelSpecification = {
	name: "claude-sonnet-5",
	provider: "anthropic",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "xhigh", "high", "medium", "low"],
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
	contextWindowSize: 1_000_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
