import { AgentLoopRepository } from "@domain/agent/agent-loop-repository"
import { ToolUseResult } from "@domain/generative-model/context/items/tool-use-result"

export class ReceiveToolOutputUseCase {
	private readonly agentLoopRepository: AgentLoopRepository

	constructor(agentLoopRepository: AgentLoopRepository) {
		this.agentLoopRepository = agentLoopRepository
	}

	async execute(agentLoopId: string, operationId: string, result: ToolUseResult, occuredAt: Date): Promise<void> {
		const agentLoop = await this.agentLoopRepository.getById(agentLoopId)

		if (!agentLoop) {
			throw new Error(`Agent loop with id ${agentLoopId} not found`)
		}

		agentLoop.receiveToolUseResult(operationId, result, occuredAt)
		await this.agentLoopRepository.save(agentLoop)
	}
}
