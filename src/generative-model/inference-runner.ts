import { RuntimeEvent } from "src/runtime/domain/runtime/event"
import { ToolUseRequest } from "./context/items/tool-use-request"
import { ModelMessageItem } from "./context/items/model-message"
import { ReasoningItem } from "./context/items/reasoning"
import { ModelContext } from "./context/model-context"
import { StructuredOutputFormat } from "./request-validation/structured-output"
import { TokenUsage } from "./token-usage"
import { Tool } from "./tool"

export type InferenceRequest = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: Tool[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: ModelContext
}

export type InferenceItem = ToolUseRequest | ReasoningItem | ModelMessageItem

export type InferenceResult = {
	items: InferenceItem[]
	tokenUsage: TokenUsage | undefined
	rowResponse: any
}

export interface InferenceRunner {
	run(request: InferenceRequest): Promise<InferenceResult>
	stream(request: InferenceRequest): AsyncGenerator<RuntimeEvent>
}
