import type { InferenceEndpointMapper } from "@agent/domain/inference/inference-endpoint-mapper"
import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import type { InferenceResult } from "@agent/domain/inference/inference-result"
import { SemanticEvent } from "@util/semantic-event"

export interface InferenceEndpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceRequest): Promise<InferenceResult>
	stream(requestParams: InferenceRequest): AsyncIterable<SemanticEvent>
}
