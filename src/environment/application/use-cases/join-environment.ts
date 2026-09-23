import { EnvironmentRepository } from "@environment/domain/environment-repository"
import { Participant } from "@environment/domain/participant"

export class JoinEnvironmentUseCase {
	private readonly environmentRepository: EnvironmentRepository

	constructor(environmentRepository: EnvironmentRepository) {
		this.environmentRepository = environmentRepository
	}

	async execute(environmentId: string, participant: Participant, occurredAt: Date): Promise<void> {
		const environment = await this.environmentRepository.getById(environmentId)
		if (!environment) {
			throw new Error("Environment not found")
		}
		environment.addParticipant(participant, occurredAt)
		await this.environmentRepository.save(environment)
	}
}
