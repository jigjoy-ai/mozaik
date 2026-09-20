import { Agent } from "@domain/agent/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/runtime/situation-handler"
import { AgentRepository } from "@domain/agent/agent-repository"
import { IdGenerator } from "@domain/common/id-generator"
import { ParticipantManifest } from "@domain/runtime/participant"
import { Memory } from "@domain/agent/memory"
import { DeveloperMessageItem } from "@domain/generative-model/context/items/developer-message"
import { AgentRecord } from "@domain/agent/types"

export class CreateAgentUseCase {
	private readonly agentRepository: AgentRepository
	private readonly ids: IdGenerator

	constructor(agentRepository: AgentRepository, ids: IdGenerator) {
		this.agentRepository = agentRepository
		this.ids = ids
	}

	async execute(
		name: string,
		instruction: string,
		capabilities: readonly string[],
		tools: Tool[],
		handlers: SituationHandler[],
	): Promise<AgentRecord> {
		const id = this.ids.generate()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "agent" }
		const memory = Memory.create()
		memory.getContext().addContextItem(DeveloperMessageItem.create(instruction))

		const agentRecord: AgentRecord = { id, manifest, tools, memory, handlers }
		const agent = Agent.create(agentRecord)
		await this.agentRepository.save(agent)
		return agentRecord
	}
}
