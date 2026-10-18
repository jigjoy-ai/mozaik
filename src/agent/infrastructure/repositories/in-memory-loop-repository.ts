import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export class InMemoryLoopRepository implements LoopRepository {
	private loops: Loop[] = []

	findById(id: string): Promise<Loop | undefined> {
		return Promise.resolve(this.loops.find((loop) => loop.id === id))
	}
	save(loop: Loop): Promise<void> {
		const index = this.loops.findIndex((stored) => stored.id === loop.id)
		if (index === -1) {
			this.loops.push(loop)
		} else {
			this.loops[index] = loop
		}
		return Promise.resolve()
	}
}
