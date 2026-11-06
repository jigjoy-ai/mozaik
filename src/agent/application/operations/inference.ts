import { InferenceResult } from "@agent/domain/inference/inference-result"
import { Directive } from "@network/peer/directive"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { DirectiveResult } from "@network/peer/directive-result"
import { InferenceRunner } from "@agent/domain/inference/inference-runner"
import { InferenceRequest } from "@agent/domain/inference/inference-request"

export class Inference implements Directive {
	id: string = "inference"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly inferenceRunner: InferenceRunner,
	) {}

	async invoke(input: {
		loopId: string
		directiveId: string
		request: InferenceRequest
	}): Promise<DirectiveResult<InferenceResult>> {
		let loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const inferenceResult: InferenceResult = await this.inferenceRunner.run(input.request)

		const directiveResult: DirectiveResult<InferenceResult> = {
			directiveId: input.directiveId,
			result: inferenceResult,
		}
		loop.acceptResult(directiveResult)
		return directiveResult
	}
}
