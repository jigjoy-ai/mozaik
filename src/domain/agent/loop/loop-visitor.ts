import { SemanticEvent } from "@domain/environment/semantic-event/event"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { LoopTransition, ModelMessageParams, ReceivedMessage } from "./loop-state"
import { InferenceInput, InferenceOutput } from "./states/inference"
import { FunctionCallParams } from "./states/function-call"

export interface LoopVisitor {
	visitMessageReceivedStarted(input: ReceivedMessage): void

	visitMessageReceivedCompleted(output: InferenceInput): void

	visitInferenceStarted(input: InferenceInput): void

	visitInferenceEvent(event: SemanticEvent): void

	visitInferenceCompleted(output: InferenceOutput): void

	visitFunctionCallStarted(input: FunctionCallParams): void

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void

	visitModelAnswer(input: ModelMessageParams): void

	visitInterceptionStarted(transition: LoopTransition): void

	visitInterceptionFinished(transition: LoopTransition): void
}
