import { Agent } from "@agent/domain/agent"
import { Tool } from "@inference/tool"
import { SituationHandler } from "@environment/domain/situation-handler"
import { AgentRepository } from "@agent/domain/agent-repository"
import { IdGenerator } from "@util/id-generator"
import { ParticipantManifest } from "@environment/domain/participant"
import { Memory } from "@agent/domain/memory"
import { DeveloperMessageItem } from "@inference/context"
import { AgentRecord } from "@agent/domain/types"

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
		const developerMessageItem: DeveloperMessageItem = {
			type: "message",
			role: "developer",
			content: {
				type: "input_text",
				text: instruction,
			},
		}
		memory.getContext().items.push(developerMessageItem)

		const agentRecord: AgentRecord = { id, manifest, tools, memory, handlers }
		const agent = Agent.create(agentRecord)
		await this.agentRepository.save(agent)
		return agentRecord
	}
}
