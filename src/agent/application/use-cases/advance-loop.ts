import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export type AdvanceLoopInput = {
	loopId: string
}

export class AdvanceLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(input: AdvanceLoopInput): Promise<void> {
		const loop: Loop | undefined = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const pendingDirective = loop.getPendingDirective()
		if (!pendingDirective) {
			throw new Error("No pending directive found")
		}

		await this.loopRepository.save(loop)
	}
}
