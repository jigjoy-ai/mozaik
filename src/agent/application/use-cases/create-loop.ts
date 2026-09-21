import { AgentLoop } from "src/agent/domain/agent-loop"
import { AgentLoopRepository } from "src/agent/domain/agent-loop-repository"
import { AgentRepository } from "src/agent/domain/agent-repository"
import { Clock } from "src/util/clock"
import { IdGenerator } from "src/util/id-generator"
import { InferenceRequest } from "src/runtime/domain/generative-model/inference-runner"

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
