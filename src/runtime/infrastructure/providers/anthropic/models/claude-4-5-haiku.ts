import type { ModelSpecification } from "src/runtime/domain/generative-model/generative-model"

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
		"function_call",
		"function_call_output",
		"model_message",
	],
	supportsStreaming: true,
	contextWindowSize: 200_000,
	maxOutputTokens: 64_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
