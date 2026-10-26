import { InferenceResult } from "@inference/inference-result"
import { Operation } from "@peer/operation"
import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { DirectiveResult } from "@peer/directive-result"
import { InferenceRunner } from "@inference/inference-runner"
import { InferenceRequest } from "@inference/index"

export class Inference implements Operation {
	id: string = "inference"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly inferenceRunner: InferenceRunner,
	) {}

	async invoke(input: { loopId: string; operationId: string; request: InferenceRequest }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const inferenceResult: InferenceResult = await this.inferenceRunner.run(input.request)

		const directiveResult: DirectiveResult = {
			directiveId: input.operationId,
			output: inferenceResult,
		}
		loop.acceptResult(directiveResult)
		return loop
	}
}
