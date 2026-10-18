import { Operation } from "@peer/operation"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { Loop } from "@agent/domain/loop/loop"

export class PauseLoop implements Operation {
	id: string = "pause_loop"

	constructor(private readonly loopRepository: LoopRepository) {}

	async invoke(input: { loopId: string; reason: string }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}
		loop.pause()
		return loop
	}
}
