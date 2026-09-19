import { LoopVisitor } from "@domain/agent-loop/loop-visitor"
import { LoopState } from "@domain/agent-loop/loop-state"
import { InferenceInput, InferenceOutput, InferenceRunner } from "@domain/agent-loop/inference"
import { LoopStateExecution } from "@domain/agent-loop/loop-state"

export class InferenceStreamingState implements LoopState<InferenceInput, LoopStateExecution<"inference_streaming">> {
	readonly id = "inference_streaming"

	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async run(input: InferenceInput, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"inference_streaming">> {
		loopVisitor.visitInferenceStarted(input)

		let output: InferenceOutput | undefined = undefined

		for await (const event of this.inferenceRunner.stream(input)) {
			loopVisitor.visitInferenceEvent(event)

			if (event.type === "inference.output") {
				output = event.payload as InferenceOutput
			}
		}

		if (!output) {
			throw new Error("Inference output not found")
		}

		loopVisitor.visitInferenceCompleted(output)

		return {
			stateId: "inference_streaming",
			input,
			output,
		}
	}
}
