import { ParticipantJoinedEvent, ParticipantLeftEvent, RuntimeEvent } from "@environment/event"
import { Participant } from "@environment/participant"

export class Environment {
	private readonly id: string
	private readonly ownerId: string
	private name: string
	private participants: Participant[]

	constructor(id: string, name: string, ownerId: string, participants: Participant[]) {
		this.id = id
		this.ownerId = ownerId
		this.name = name
		this.participants = participants
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name
	}

	getOwnerId(): string {
		return this.ownerId
	}

	addParticipant(participant: Participant, occurredAt: Date): RuntimeEvent | undefined {
		const alreadyExists = this.participants.find((p) => p.getId() === participant.getId())

		if (alreadyExists) return

		this.participants.push(participant)

		return ParticipantJoinedEvent.init(participant.getManifest(), occurredAt)
	}

	getParticipant(id: string): Participant | undefined {
		const participant = this.getParticipants().find((p) => p.getId() === id)
		if (!participant) {
			throw new Error(`Participant ${id} not found`)
		}

		return participant
	}

	removeParticipant(participant: Participant, occurredAt: Date): RuntimeEvent {
		this.participants = this.participants.filter((p) => p.getId() !== participant.getId())

		return ParticipantLeftEvent.init(participant.getManifest(), occurredAt)
	}

	getParticipants(): Participant[] {
		return [...this.participants]
	}

	static create(id: string, name: string, ownerId: string, participants: Participant[] = []): Environment {
		return new Environment(id, name, ownerId, participants)
	}

	static rehydrate({
		id,
		name,
		ownerId,
		participants,
	}: {
		id: string
		name: string
		ownerId: string
		participants: Participant[]
	}): Environment {
		return new Environment(id, name, ownerId, participants)
	}
}
