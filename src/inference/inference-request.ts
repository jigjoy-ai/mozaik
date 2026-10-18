import { StructuredOutputFormat } from "@inference/request-validation/structured-output"
import { Context } from "@inference/context"
import { Contract } from "@peer/contract"

export interface InferenceRequest {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Contract[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}
