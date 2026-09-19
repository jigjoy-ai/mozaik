import { LoopState, LoopStateExecution, ModelMessageParams } from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"

export class ModelMessageState implements LoopState<ModelMessageParams, LoopStateExecution<"model_message">> {
	readonly id = "model_message"

	async run(input: ModelMessageParams, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"model_message">> {
		loopVisitor.visitModelAnswer(input)
		return {
			stateId: this.id,
			input,
			output: undefined,
		}
	}
}
