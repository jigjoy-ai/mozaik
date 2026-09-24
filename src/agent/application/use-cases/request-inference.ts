import { LoopRepository } from "@agent/loop/repository"
import { PendingInference } from "@agent/record"
import { IdGenerator } from "@util/id-generator"
import { Clock } from "@util/clock"
import { InferenceRequest } from "@agent/inference/inference-runner"

export class RequestInferenceUseCase {
	constructor(
		private readonly loops: LoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(loopId: string, request: InferenceRequest): Promise<PendingInference> {
		const loop = await this.loops.getById(loopId)

		if (!loop) {
			throw new Error(`Agent loop ${loopId} not found`)
		}

		const operation = loop.requestInference(this.ids.generate(), request, this.clock.now())

		await this.loops.save(loop)

		return operation
	}
}
