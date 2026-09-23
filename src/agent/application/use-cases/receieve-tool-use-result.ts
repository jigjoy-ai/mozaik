import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { ToolUseResult } from "@agent/domain/inference/context"
import { Clock } from "@util/clock"

export class ReceiveToolUseResultUseCase {
	private readonly agentLoopRepository: AgentLoopRepository
	private readonly clock: Clock

	constructor(agentLoopRepository: AgentLoopRepository, clock: Clock) {
		this.agentLoopRepository = agentLoopRepository
		this.clock = clock
	}

	async execute(agentLoopId: string, operationId: string, result: ToolUseResult): Promise<void> {
		const agentLoop = await this.agentLoopRepository.getById(agentLoopId)

		if (!agentLoop) {
			throw new Error(`Agent loop with id ${agentLoopId} not found`)
		}

		const occuredAt = this.clock.now()
		agentLoop.receiveToolUseResult(operationId, result, occuredAt)
		await this.agentLoopRepository.save(agentLoop)
	}
}
