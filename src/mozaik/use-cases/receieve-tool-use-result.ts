import { LoopRepository } from "@agent/loop/repository"
import { ToolUseResult } from "@inference/context"
import { Clock } from "@util/clock"

export class ReceiveToolUseResultUseCase {
	private readonly loopRepository: LoopRepository
	private readonly clock: Clock

	constructor(loopRepository: LoopRepository, clock: Clock) {
		this.loopRepository = loopRepository
		this.clock = clock
	}

	async execute(loopId: string, operationId: string, result: ToolUseResult): Promise<void> {
		const loop = await this.loopRepository.getById(loopId)

		if (!loop) {
			throw new Error(`Loop with id ${loopId} not found`)
		}

		const occuredAt = this.clock.now()
		loop.receiveToolUseResult(operationId, result, occuredAt)
		await this.loopRepository.save(loop)
	}
}
