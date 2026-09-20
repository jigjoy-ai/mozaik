import { Environment } from "@domain/environment/environment"
import { EnvironmentRepository } from "@domain/environment/environment-repository"
import { Participant } from "@domain/environment/participant"

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
