import { Environment } from "src/environment/domain/runtime/environment"
import { EnvironmentRepository } from "src/environment/domain/runtime/environment-repository"
import { Participant } from "src/environment/domain/runtime/participant"

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
