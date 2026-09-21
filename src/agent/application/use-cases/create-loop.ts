import { AgentLoop } from "@agent/domain/agent-loop"
import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { AgentRepository } from "@agent/domain/agent-repository"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"

export class CreateAgentLoopUseCase {
	constructor(
		private readonly agentRepository: AgentRepository,
		private readonly agentLoopRepository: AgentLoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(agentId: string, subject: string): Promise<AgentLoop> {
		const agentExists = await this.agentRepository.exists(agentId)

		if (!agentExists) {
			throw new Error(`Agent with id ${agentId} not found`)
		}

		const agentLoop = AgentLoop.create(this.ids.generate(), subject, this.clock.now())
		await this.agentLoopRepository.save(agentLoop)
		return agentLoop
	}
}
