import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { Loop } from "@agent/domain/loop/loop"

export class EndLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async invoke(input: { loopId: string; modelMessage: string }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}
		loop.end()
		await this.loopRepository.save(loop)
		return loop
	}
}
