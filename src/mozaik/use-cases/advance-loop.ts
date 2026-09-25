import { Loop } from "@agent/loop"
import { LoopController } from "@agent/loop/controller"
import { InferenceRunner } from "@inference/inference-runner"

export class AdvanceLoopUseCase {
	constructor(private readonly inferenceRunner: InferenceRunner) {}

	async execute(loop: Loop, controller: LoopController): Promise<Loop> {
		const next = controller.decide()
		console.log("decision:", next)

		if (next?.type === "request_inference") {
			const pending = loop.requestInference("op-1", next.request, new Date())
			const result = await this.inferenceRunner.run(next.request)
			loop.receiveInferenceResult(pending.id, result, new Date())
			console.log("model output:", result.items)
		}

		return loop
	}
}
