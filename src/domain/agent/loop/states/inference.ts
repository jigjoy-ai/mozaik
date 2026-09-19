import { LoopState, LoopStateExecution } from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"
import { SemanticEvent } from "@domain/environment/semantic-event/event"
import { StructuredOutputFormat } from "@domain/generative-model/request-validation/structured-output"
import { TokenUsage } from "@domain/generative-model/token-usage"
import { Tool } from "@domain/generative-model/tool"
import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"
import { ModelMessageItem } from "@domain/generative-model/context/items/model-message"
import { ReasoningItem } from "@domain/generative-model/context/items/reasoning"
import { ModelContext } from "@domain/generative-model/context/model-context"

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

export class InferenceState implements LoopState<InferenceInput, LoopStateExecution<"inference">> {
	readonly id = "inference"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(input: InferenceInput, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"inference">> {
		loopVisitor.visitInferenceStarted(input)

		const output = await this.inferenceRunner.run(input)

		loopVisitor.visitInferenceCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
