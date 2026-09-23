import { Squad } from "@environment/domain/squad"
import { SquadRepository } from "@environment/domain/squad-repository"
import { Participant } from "@environment/domain/participant"
import { IdGenerator } from "@util/id-generator"

export class CreateSquadUseCase {
	private readonly squadRepository: SquadRepository
	private readonly idGenerator: IdGenerator

	constructor(squadRepository: SquadRepository, idGenerator: IdGenerator) {
		this.squadRepository = squadRepository
		this.idGenerator = idGenerator
	}

	async execute(name: string, ownerId: string, participants: Participant[]): Promise<Squad> {
		const environmentId = this.idGenerator.generate()
		const environment = Squad.create(environmentId, name, ownerId, participants)

		await this.squadRepository.save(environment)
		return environment
	}
}
