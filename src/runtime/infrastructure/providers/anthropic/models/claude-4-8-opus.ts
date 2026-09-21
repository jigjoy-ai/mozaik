import type { ModelSpecification } from "src/runtime/domain/generative-model/generative-model"

export const claudeOpus48Specification: ModelSpecification = {
	name: "claude-opus-4-8",
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
	contextWindowSize: 200_000,
	maxOutputTokens: 32_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
