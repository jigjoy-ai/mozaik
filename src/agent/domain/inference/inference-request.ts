import { StructuredOutputFormat } from "@agent/domain/inference/request-validation/structured-output"
import type { Context } from "@agent/domain/inference/context"
import type { ToolDefinition } from "@agent/domain/inference/tool"

export interface InferenceRequest {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: ToolDefinition[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}
