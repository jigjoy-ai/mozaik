import { Agent } from "@agent/agent"
import { Tool } from "@inference/tool"
import { SituationHandler } from "@environment/situation-handler"
import { AgentRepository } from "@agent/agent-repository"
import { IdGenerator } from "@util/id-generator"
import { ParticipantManifest } from "@environment/participant"
import { Memory } from "@agent/memory"
import { DeveloperMessageItem } from "@inference/context"
import { AgentRecord } from "@agent/record"

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
