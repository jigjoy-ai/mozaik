import { Memory } from "@domain/agent/memory"
import { Participant, ParticipantManifest } from "@domain/environment/participant"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/environment/situation-handler"
import { DeveloperMessageItem } from "@domain/generative-model/context/items/developer-message"

export class Agent extends Participant {
	private memory: Memory
	private developerMessage: string
	private tools: Tool[]

	constructor(
		manifest: ParticipantManifest,
		developerMessage: string,
		tools: Tool[],
		memory: Memory,
		handlers: SituationHandler[],
	) {
		super(manifest, handlers)
		this.memory = memory
		this.developerMessage = developerMessage
		this.tools = tools
	}

	getTools(): Tool[] {
		return this.tools
	}

	getDeveloperMessage(): string {
		return this.developerMessage
	}

	getMemory(): Memory {
		return this.memory
	}

	static create({
		name,
		instruction,
		tools,
		capabilities,
		handlers,
	}: {
		instruction: string
		tools: Tool[]
		name: string
		capabilities: readonly string[]
		handlers: SituationHandler[]
	}): Agent {
		const id = crypto.randomUUID()
		const memory = Memory.create()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "agent" }

		const developerMessage = DeveloperMessageItem.create(instruction)
		memory.getContext().addContextItem(developerMessage)
		return new Agent(manifest, instruction, tools, memory, handlers)
	}
}
