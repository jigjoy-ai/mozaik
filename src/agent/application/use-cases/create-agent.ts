import { Agent } from "@agent/domain/agent"
import { AgentRepository } from "@agent/domain/agent-repository"
import { MemoryFactory } from "@agent/domain/memory"
import { CreateAgentParams } from "@agent/types"

export class CreateAgentUseCase {
	private readonly agentRepository: AgentRepository
	private readonly memoryFactory: MemoryFactory

	constructor(agentRepository: AgentRepository, memoryFactory: MemoryFactory) {
		this.agentRepository = agentRepository
		this.memoryFactory = memoryFactory
	}

	async invoke(input: CreateAgentParams): Promise<Agent> {
		const memory = this.memoryFactory.create()

		const agent = Agent.create({ name: input.name, instruction: input.instruction, tools: input.tools, memory })
		await this.agentRepository.save(agent)
		return agent
	}
}
