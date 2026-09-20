import { LoopState, LoopStateExecution } from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"
import { InferenceInput, InferenceRunner } from "@domain/generative-model/inference-runner"
import { AgentLoop } from "../agent-loop"

export class InferenceState implements LoopState<InferenceInput, LoopStateExecution<"inference">> {
	readonly id = "inference"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(
		input: InferenceInput,
		agentLoop: AgentLoop,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"inference">> {
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
