import type { InferenceEndpointMapper } from "@inference/inference-endpoint-mapper"
import { InferenceRequest, InferenceResult } from "@inference/inference-runner"
import { RuntimeEvent } from "@environment/domain/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceRequest): Promise<InferenceResult>
	stream(requestParams: InferenceRequest): AsyncIterable<RuntimeEvent>
}
