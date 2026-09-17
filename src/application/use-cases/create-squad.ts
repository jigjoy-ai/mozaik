import { Squad } from "@domain/agentic-environment/squad"
import { SquadRepository } from "@domain/agentic-environment/squad-repository"

export class CreateSquadUseCase {
	private readonly squadRepository: SquadRepository

	constructor(squadRepository: SquadRepository) {
		this.squadRepository = squadRepository
	}

	async execute(name: string, ownerId: string, members: string[]): Promise<Squad> {
		const squad = Squad.create(name, ownerId, members)
		await this.squadRepository.save(squad)
		return squad
	}
}
