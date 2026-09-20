import { RuntimeEvent } from "@domain/runtime/event"
import { FunctionCallItem } from "./context/items/function-call"
import { ModelMessageItem } from "./context/items/model-message"
import { ReasoningItem } from "./context/items/reasoning"
import { ModelContext } from "./context/model-context"
import { StructuredOutputFormat } from "./request-validation/structured-output"
import { TokenUsage } from "./token-usage"
import { Tool } from "./tool"

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
	stream(request: InferenceInput): AsyncGenerator<RuntimeEvent>
}
