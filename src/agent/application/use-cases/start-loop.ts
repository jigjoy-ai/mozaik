import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { Operation } from "@peer/operation"
import { Context } from "@inference/context"

export type StartLoopInput = {
	agentId: string
	subject: string
}

export class StartLoop implements Operation {
	id: string = "start_loop"

	constructor(private readonly loopRepository: LoopRepository) {}

	async invoke(input: StartLoopInput): Promise<Loop> {
		const context: Context = {
			items: [],
		}
		const loop = new Loop(input.agentId, input.subject, input.agentId, context, "idle")
		await this.loopRepository.save(loop)
		return loop
	}
}
