import { Agent } from "@domain/agentic-environment/participant/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/agentic-environment/situation/situation-handler"

export interface AgentRepository {
	save(agent: Agent): Promise<void>
	getById(id: string): Promise<Agent | undefined>
	getAll(): Promise<Agent[]>
}

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
