import { RuntimeEvent } from "@environment/event"
import { ModelContext } from "@inference/context"
import { StructuredOutputFormat } from "@inference/request-validation/structured-output"
import { TokenUsage } from "@inference/token-usage"
import { Tool } from "@inference/tool"
import { ModelOutputItem } from "@inference/context"

export type InferenceRequest = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
}

export type InferenceResult = {
	items: ModelOutputItem[]
	tokenUsage: TokenUsage | undefined
	rowResponse: any
}

export interface InferenceRunner {
	run(request: InferenceRequest): Promise<InferenceResult>
	stream(request: InferenceRequest): AsyncGenerator<RuntimeEvent>
}
