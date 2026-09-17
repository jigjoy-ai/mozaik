import { FunctionCallParams } from "@app/states/function-call"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { LoopTransition, ModelMessageParams, ReceivedMessage } from "./loop-state"
import { InferenceInput, InferenceOutput } from "./inference"

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
