import { Loop } from "@agent/loop"
import { LoopRepository } from "@agent/loop/repository"
import { AgentRepository } from "@agent/agent-repository"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"
import { LoopRule } from "@agent/loop/rule"
import { LoopController } from "@agent/loop/controller"

export class CreateAgentLoopUseCase {
	constructor(
		private readonly agentRepository: AgentRepository,
		private readonly loopRepository: LoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(agentId: string, subject: string, rules: LoopRule[]): Promise<Loop> {
		const agentExists = await this.agentRepository.exists(agentId)

		if (!agentExists) {
			throw new Error(`Agent with id ${agentId} not found`)
		}

		const controller = new LoopController(rules)
		const loop = Loop.create(this.ids.generate(), subject, this.clock.now(), controller)
		await this.loopRepository.save(loop)
		return loop
	}
}
