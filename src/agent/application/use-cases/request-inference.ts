import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { PendingInference } from "@agent/domain/types"
import { IdGenerator } from "@util/id-generator"
import { Clock } from "@util/clock"
import { InferenceRequest } from "@inference/inference-runner"

export class RequestInferenceUseCase {
	constructor(
		private readonly loops: AgentLoopRepository,
		private readonly ids: IdGenerator,
		private readonly clock: Clock,
	) {}

	async execute(loopId: string, request: InferenceRequest): Promise<PendingInference> {
		const loop = await this.loops.getById(loopId)

		if (!loop) {
			throw new Error(`Agent loop ${loopId} not found`)
		}

		const operation = loop.requestInference(this.ids.generate(), request, this.clock.now())

		await this.loops.save(loop)

		return operation
	}
}
