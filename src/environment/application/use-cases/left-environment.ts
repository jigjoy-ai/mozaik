import { EnvironmentRepository } from "src/environment/domain/runtime/environment-repository"
import { Participant } from "src/environment/domain/runtime/participant"

export class LeftEnvironmentUseCase {
	private readonly environmentRepository: EnvironmentRepository

	constructor(environmentRepository: EnvironmentRepository) {
		this.environmentRepository = environmentRepository
	}

	async execute(environmentId: string, participant: Participant): Promise<void> {
		const environment = await this.environmentRepository.getById(environmentId)
		if (!environment) {
			throw new Error("Environment not found")
		}
		environment.removeParticipant(participant)
		await this.environmentRepository.save(environment)
	}
}
