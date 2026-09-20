import { Environment } from "@domain/runtime/environment"
import { EnvironmentRepository } from "@domain/runtime/environment-repository"
import { Participant } from "@domain/runtime/participant"

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
