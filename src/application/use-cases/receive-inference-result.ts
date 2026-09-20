import { AgentLoopRepository } from "@domain/agent/agent-loop-repository"
import { InferenceResult } from "@domain/generative-model/inference-runner"

export class ReceiveInferenceResultUseCase {
	private readonly agentLoopRepository: AgentLoopRepository

	constructor(agentLoopRepository: AgentLoopRepository) {
		this.agentLoopRepository = agentLoopRepository
	}

	async execute(
		agentLoopId: string,
		operationId: string,
		inferenceResult: InferenceResult,
		occuredAt: Date,
	): Promise<void> {
		const agentLoop = await this.agentLoopRepository.getById(agentLoopId)

		if (!agentLoop) {
			throw new Error(`Agent loop with id ${agentLoopId} not found`)
		}

		agentLoop.receiveInferenceResult(operationId, inferenceResult, occuredAt)
		await this.agentLoopRepository.save(agentLoop)
	}
}
