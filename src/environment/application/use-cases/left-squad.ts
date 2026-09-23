import { SquadRepository } from "@environment/domain/squad-repository"
import { Participant } from "@environment/domain/participant"
import { EventPublisher } from "@environment/domain/event-publisher"

export class LeftSquadUseCase {
	private readonly squadRepository: SquadRepository
	private readonly eventPublisher: EventPublisher

	constructor(squadRepository: SquadRepository, eventPublisher: EventPublisher) {
		this.squadRepository = squadRepository
		this.eventPublisher = eventPublisher
	}

	async execute(squadId: string, participant: Participant, occurredAt: Date): Promise<void> {
		const squad = await this.squadRepository.getById(squadId)
		if (!squad) {
			throw new Error("Squad not found")
		}
		const event = squad.removeParticipant(participant, occurredAt)
		if (event) {
			this.eventPublisher.publish(event, squad.getParticipants())
		}
		await this.squadRepository.save(squad)
	}
}
