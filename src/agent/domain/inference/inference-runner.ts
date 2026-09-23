import { RuntimeEvent } from "@environment/domain/event"
import { ModelContext } from "@agent/domain/inference/context"
import { StructuredOutputFormat } from "@agent/domain/inference/request-validation/structured-output"
import { TokenUsage } from "@agent/domain/inference/token-usage"
import { Tool } from "@agent/domain/inference/tool"
import { ModelOutputItem } from "@agent/domain/inference/context"

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
