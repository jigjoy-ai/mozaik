import { Agent } from "@agent/domain/agent"
import { AgentRepository } from "@agent/domain/agent-repository"
import { MemoryFactory } from "@agent/domain/memory"
import { Contract } from "@peer/contract"
import { Operation } from "@peer/operation"

export class CreateAgent implements Operation {
	id: string = "create_agent"

	private readonly agentRepository: AgentRepository
	private readonly memoryFactory: MemoryFactory

	constructor(agentRepository: AgentRepository, memoryFactory: MemoryFactory) {
		this.agentRepository = agentRepository
		this.memoryFactory = memoryFactory
	}

	async invoke(input: { name: string; instruction: string; tools: Contract[] }): Promise<Agent> {
		const memory = this.memoryFactory.create()

		const agent = Agent.create({ name: input.name, instruction: input.instruction, tools: input.tools, memory })
		await this.agentRepository.save(agent)
		return agent
	}
}
