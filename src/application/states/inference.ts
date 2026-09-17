import { InferenceInput, InferenceRunner } from "@domain/agentic-environment/loop/inference"
import { LoopState, LoopStateExecution } from "@domain/agentic-environment/loop/loop-state"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

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
