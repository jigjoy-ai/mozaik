import { ParticipantJoinedEvent, ParticipantLeftEvent, RuntimeEvent } from "./event"
import { Participant } from "./participant"

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

	addParticipant(participant: Participant): void {
		const alreadyExists = this.participants.find((p) => p.getId() === participant.getId())

		if (alreadyExists) return
		this.participants.push(participant)

		this.publish(ParticipantJoinedEvent.init(participant.getManifest()))
	}

	getParticipant(id: string): Participant | undefined {
		const participant = this.getParticipants().find((p) => p.getId() === id)
		if (!participant) {
			throw new Error(`Participant ${id} not found`)
		}

		return participant
	}

	removeParticipant(participant: Participant): void {
		this.participants = this.participants.filter((p) => p.getId() !== participant.getId())

		this.publish(ParticipantLeftEvent.init(participant.getManifest()))
	}

	getParticipants(): Participant[] {
		return [...this.participants]
	}

	private process(event: RuntimeEvent, consumer: Participant): void {
		for (const handler of consumer.getHandlers()) {
			const isSatisfied = handler.specification.isSatisfiedBy({
				event,
				participant: consumer,
			})
			if (isSatisfied) {
				handler.processor.apply({ event, participant: consumer })
			}
		}
	}

	publish(event: RuntimeEvent): void {
		for (const participant of this.participants) {
			this.process(event, participant)
		}
	}

	static create(name: string, ownerId: string, participants: Participant[] = []): Environment {
		const id = crypto.randomUUID()
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
