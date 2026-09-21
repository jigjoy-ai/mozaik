import { Environment } from "@environment/domain/environment"
import { EnvironmentRepository } from "@environment/domain/environment-repository"
import { Participant } from "@environment/domain/participant"

export class CreateEnvironmentUseCase {
	private readonly environmentRepository: EnvironmentRepository

	constructor(environmentRepository: EnvironmentRepository) {
		this.environmentRepository = environmentRepository
	}

	async execute(name: string, ownerId: string, participants: Participant[]): Promise<Environment> {
		const environment = Environment.create(name, ownerId, participants)
		await this.environmentRepository.save(environment)
		return environment
	}
}
