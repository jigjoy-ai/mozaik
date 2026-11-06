import { SpaceEvent } from "@util/space-event"
import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import { InferenceResult } from "@agent/domain/inference/inference-result"

export interface InferenceRunner {
	run(request: InferenceRequest): Promise<InferenceResult>
	stream(request: InferenceRequest): AsyncGenerator<SpaceEvent>
}
