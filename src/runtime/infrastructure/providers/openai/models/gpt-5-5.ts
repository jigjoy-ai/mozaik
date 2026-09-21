import type { ModelSpecification } from "src/runtime/domain/generative-model/generative-model"

export const gpt55Specification: ModelSpecification = {
	name: "gpt-5.5",
	provider: "openai",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["xhigh", "high", "medium", "low", "none"],
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
