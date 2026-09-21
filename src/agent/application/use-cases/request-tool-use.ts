import { AgentLoopRepository } from "src/agent/domain/agent-loop-repository"
import { PendingToolExecution } from "src/agent/domain/types"
import { Clock } from "src/util/clock"
import { IdGenerator } from "src/util/id-generator"
import { ToolUseRequest } from "src/inference/context"

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
