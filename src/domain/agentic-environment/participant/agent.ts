import { Memory } from "./memory"
import { Participant, ParticipantManifest } from "./participant"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "../situation/situation-handler"
import { DeveloperMessageItem } from "@domain/model-context/context-item/client-item/developer-message"

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

	participantJoined(participant: Participant): void {
		if (this.getId() === participant.getId()) {
			return
		}

		const particpantJoinedMessage = `The participant with id ${participant.getId()} joined the conversation.
		
		Their capabilities are: ${participant.getManifest().capabilities}.
		Their role is: ${participant.getManifest().role}.

		You can communicate with them using the sendMessage tool to delegate them tasks or whatever the situation context requires.
		`

		this.memory.getContext().addContextItem(DeveloperMessageItem.create(particpantJoinedMessage))
	}

	participantLeft(participant: Participant): void {
		if (this.getId() === participant.getId()) {
			return
		}

		const particpantLeftMessage = `The participant with id ${participant.getId()} left the conversation.
		They were a ${participant.getManifest().role} with the following capabilities: ${participant.getManifest().capabilities}.
		
		From now on, you can't communicate with them anymore, nor delegate them tasks.
		`

		this.memory.getContext().addContextItem(DeveloperMessageItem.create(particpantLeftMessage))
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
