import { InferenceResult } from "@inference/inference-result"
import { Operation } from "@peer/operation"
import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { DirectiveResult } from "@peer/directive-result"

export class Inference implements Operation {
	id: string = "inference"

	constructor(private readonly loopRepository: LoopRepository) {}

	async invoke(input: { loopId: string; operationId: string; result: InferenceResult }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const directiveResult: DirectiveResult = {
			directiveId: input.operationId,
			output: input.result,
		}
		loop.acceptResult(directiveResult)
		return loop
	}
}
