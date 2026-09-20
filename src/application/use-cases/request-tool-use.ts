import { AgentLoopRepository } from "@domain/agent/agent-loop-repository"
import { PendingToolExecution } from "@domain/agent/types"
import { Clock } from "@domain/common/clock"
import { IdGenerator } from "@domain/common/id-generator"
import { ToolUseRequest } from "@domain/generative-model/context/items/tool-use-request"

export class RequestToolUseUseCase {
	constructor(
		private readonly loops: AgentLoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(loopId: string, call: ToolUseRequest): Promise<PendingToolExecution> {
		const loop = await this.loops.getById(loopId)

		if (!loop) {
			throw new Error(`Agent loop ${loopId} not found`)
		}

		const operation = loop.requestToolUse(this.ids.generate(), call, this.clock.now())

		await this.loops.save(loop)

		return operation
	}
}
