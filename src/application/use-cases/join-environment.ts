import { EnvironmentRepository } from "@domain/runtime/environment-repository"
import { Participant } from "@domain/runtime/participant"

export class JoinEnvironmentUseCase {
	private readonly environmentRepository: EnvironmentRepository

	constructor(environmentRepository: EnvironmentRepository) {
		this.environmentRepository = environmentRepository
	}

	async execute(environmentId: string, participant: Participant): Promise<void> {
		const environment = await this.environmentRepository.getById(environmentId)
		if (!environment) {
			throw new Error("Environment not found")
		}
		environment.addParticipant(participant)
		await this.environmentRepository.save(environment)
	}
}
