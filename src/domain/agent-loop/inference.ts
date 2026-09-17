import { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"
import { TokenUsage } from "@domain/generative-model/token-usage"
import { Tool } from "@domain/generative-model/tool"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { ReasoningItem } from "@domain/model-context/context-item/model-item/reasoning"
import { ModelContext } from "@domain/model-context/model-context"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export type InferenceInput = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
}

export type InferenceItem = FunctionCallItem | ReasoningItem | ModelMessageItem

export type InferenceOutput = {
	items: InferenceItem[]
	tokenUsage: TokenUsage | undefined
	rowResponse: any
}

export interface InferenceRunner {
	run(request: InferenceInput): Promise<InferenceOutput>
	stream(request: InferenceInput): AsyncGenerator<SemanticEvent>
}
