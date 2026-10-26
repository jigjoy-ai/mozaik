import { StructuredOutputFormat } from "@inference/request-validation/structured-output"
import { Context } from "@inference/context"
import { Tool } from "./tool"

export interface InferenceRequest {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}
