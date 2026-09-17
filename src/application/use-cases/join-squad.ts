import { SquadRepository } from "@domain/agentic-environment/squad-repository"

export class JoinSquadUseCase {
	private readonly squadRepository: SquadRepository

	constructor(squadRepository: SquadRepository) {
		this.squadRepository = squadRepository
	}

	async execute(squadId: string, memberId: string): Promise<void> {
		const squad = await this.squadRepository.getById(squadId)
		if (!squad) {
			throw new Error("Squad not found")
		}
		squad.addMember(memberId)
		await this.squadRepository.save(squad)
	}
}
