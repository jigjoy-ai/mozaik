import type { ModelSpecification } from "@agent/inference/generative-model"

export const gpt54MiniSpecification: ModelSpecification = {
	name: "gpt-5.4-mini",
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
	contextWindowSize: 400_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
