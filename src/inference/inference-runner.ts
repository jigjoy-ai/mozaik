import { RuntimeEvent } from "src/environment/domain/runtime/event"
import { ModelContext } from "./context"
import { StructuredOutputFormat } from "./request-validation/structured-output"
import { TokenUsage } from "./token-usage"
import { Tool } from "./tool"
import { ModelOutputItem } from "./context"

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
