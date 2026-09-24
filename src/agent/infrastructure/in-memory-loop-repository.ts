import { Loop } from "@agent/loop"
import { LoopRepository } from "@agent/loop/repository"

export class InMemoryLoopRepository implements LoopRepository {
	private loops: Loop[] = []

	getById(id: string): Promise<Loop | undefined> {
		return Promise.resolve(this.loops.find((loop) => loop.id === id))
	}
	save(loop: Loop): Promise<void> {
		this.loops.push(loop)
		return Promise.resolve()
	}
}
