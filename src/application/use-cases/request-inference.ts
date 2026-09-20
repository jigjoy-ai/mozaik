import { AgentLoopRepository } from "@domain/agent/agent-loop-repository"
import { PendingInference } from "@domain/agent/types"
import { IdGenerator } from "@domain/common/id-generator"
import { Clock } from "@domain/common/clock"

export class RequestInferenceUseCase {
	constructor(
		private readonly loops: AgentLoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(loopId: string): Promise<PendingInference> {
		const loop = await this.loops.getById(loopId)

		if (!loop) {
			throw new Error(`Agent loop ${loopId} not found`)
		}

		const operation = loop.requestInference(this.ids.generate(), this.clock.now())

		await this.loops.save(loop)

		return operation
	}
}
