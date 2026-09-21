import type { ModelSpecification } from "src/runtime/domain/generative-model/generative-model"

export const deepSeekV4ProSpecification: ModelSpecification = {
	name: "deepseek-v4-pro",
	provider: "deepseek",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "high", "medium", "low", "none"],
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
	maxOutputTokens: 384_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: false,
}
