import { LoopRepository } from "@agent/loop/repository"
import { PendingToolExecution } from "@agent/record"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"
import { ToolUseRequest } from "@agent/inference/context"

export class RequestToolUseUseCase {
	constructor(
		private readonly loops: LoopRepository,
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
