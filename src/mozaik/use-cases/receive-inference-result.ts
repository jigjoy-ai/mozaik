import { LoopRepository } from "@agent/loop/repository"
import { InferenceResult } from "@inference/inference-runner"
import { Clock } from "@util/clock"

export class ReceiveInferenceResultUseCase {
	private readonly loopRepository: LoopRepository
	private readonly clock: Clock

	constructor(loopRepository: LoopRepository, clock: Clock) {
		this.loopRepository = loopRepository
		this.clock = clock
	}

	async execute(loopId: string, operationId: string, inferenceResult: InferenceResult): Promise<void> {
		const loop = await this.loopRepository.getById(loopId)

		if (!loop) {
			throw new Error(`Loop with id ${loopId} not found`)
		}

		const occuredAt = this.clock.now()
		loop.receiveInferenceResult(operationId, inferenceResult, occuredAt)
		await this.loopRepository.save(loop)
	}
}
