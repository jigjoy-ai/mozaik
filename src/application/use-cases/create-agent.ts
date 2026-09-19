import { Agent } from "@domain/agent/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/environment/situation-handler"
import { AgentRepository } from "@domain/agent/agent-repository"

export class CreateAgentUseCase {
	private readonly agentRepository: AgentRepository

	constructor(agentRepository: AgentRepository) {
		this.agentRepository = agentRepository
	}

	async execute(
		name: string,
		instruction: string,
		capabilities: readonly string[],
		tools: Tool[],
		handlers: SituationHandler[],
	): Promise<Agent> {
		const agent = Agent.create({ name, instruction, capabilities, tools, handlers })
		await this.agentRepository.save(agent)
		return agent
	}
}
