import { Loop } from "@agent/loop"

export interface LoopRepository {
	save(loop: Loop): Promise<void>
	getById(id: string): Promise<Loop | undefined>
}
