import type { ModelSpecification } from "@inference/generative-model"

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
		"tool_use_request",
		"tool_use_result",
		"model_message",
	],
	supportsStreaming: true,
	contextWindowSize: 1_050_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
