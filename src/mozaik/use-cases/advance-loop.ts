import { Loop } from "@agent/loop"
import { LoopController } from "@agent/loop/controller"
import { LoopRepository } from "@agent/loop/repository"
import { DefaultInferenceRunner } from "../runners/inference-runner"
import { InferenceRequestValidator } from "@inference/request-validation/inference-request-validator"
import { supportedModels } from "@inference/models"

export class AdvanceLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(loop: Loop, controller: LoopController): Promise<Loop> {
		const next = controller.decide()
		console.log("decision:", next)

		if (next?.type === "request_inference") {
			const pending = loop.requestInference("op-1", next.request, new Date())
			const inferenceRunner = new DefaultInferenceRunner(supportedModels, new InferenceRequestValidator())
			const result = await inferenceRunner.run(next.request)
			loop.receiveInferenceResult(pending.id, result, new Date())
			console.log("model output:", result.items)
		}

		return loop
	}
}
