import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { InferenceResult } from "@agent/domain/inference/inference-runner"
import { Clock } from "@util/clock"

export class ReceiveInferenceResultUseCase {
	private readonly agentLoopRepository: AgentLoopRepository
	private readonly clock: Clock

	constructor(agentLoopRepository: AgentLoopRepository, clock: Clock) {
		this.agentLoopRepository = agentLoopRepository
		this.clock = clock
	}

	async execute(agentLoopId: string, operationId: string, inferenceResult: InferenceResult): Promise<void> {
		const agentLoop = await this.agentLoopRepository.getById(agentLoopId)

		if (!agentLoop) {
			throw new Error(`Agent loop with id ${agentLoopId} not found`)
		}

		const occuredAt = this.clock.now()
		agentLoop.receiveInferenceResult(operationId, inferenceResult, occuredAt)
		await this.agentLoopRepository.save(agentLoop)
	}
}
