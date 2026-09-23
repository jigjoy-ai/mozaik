import { Environment } from "@environment/domain/environment"
import { EnvironmentRepository } from "@environment/domain/environment-repository"
import { Participant } from "@environment/domain/participant"
import { IdGenerator } from "@util/id-generator"

export class CreateEnvironmentUseCase {
	private readonly environmentRepository: EnvironmentRepository
	private readonly idGenerator: IdGenerator

	constructor(environmentRepository: EnvironmentRepository, idGenerator: IdGenerator) {
		this.environmentRepository = environmentRepository
		this.idGenerator = idGenerator
	}

	async execute(name: string, ownerId: string, participants: Participant[]): Promise<Environment> {
		const environmentId = this.idGenerator.generate()
		const environment = Environment.create(environmentId, name, ownerId, participants)
		await this.environmentRepository.save(environment)
		return environment
	}
}
