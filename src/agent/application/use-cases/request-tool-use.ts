import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { PendingToolExecution } from "@agent/domain/types"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"
import { ToolUseRequest } from "@agent/domain/inference/context"

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
