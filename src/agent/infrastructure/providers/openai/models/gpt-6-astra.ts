import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const gpt6AstraSpecification: ModelSpecification = {
	name: "gpt-6-astra",
	provider: "openai",
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
	contextWindowSize: 1_050_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
