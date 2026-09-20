import { AgentLoop } from "@domain/agent/agent-loop"
import { AgentLoopRepository } from "@domain/agent/agent-loop-repository"
import { AgentRepository } from "@domain/agent/agent-repository"
import { Clock } from "@domain/common/clock"
import { IdGenerator } from "@domain/common/id-generator"
import { InferenceRequest } from "@domain/generative-model/inference-runner"

export class CreateAgentLoopUseCase {
	constructor(
		private readonly agentRepository: AgentRepository,
		private readonly agentLoopRepository: AgentLoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(agentId: string, inferenceRequest: InferenceRequest): Promise<AgentLoop> {
		const agentExists = await this.agentRepository.exists(agentId)

		if (!agentExists) {
			throw new Error(`Agent with id ${agentId} not found`)
		}

		const agentLoop = AgentLoop.create(this.ids.generate(), inferenceRequest)
		await this.agentLoopRepository.save(agentLoop)
		return agentLoop
	}
}
