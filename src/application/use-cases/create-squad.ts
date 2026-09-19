import { Squad } from "@domain/environment/squad"
import { SquadRepository } from "@domain/environment/squad-repository"

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
