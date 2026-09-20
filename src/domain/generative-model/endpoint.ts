import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"
import { InferenceRequest, InferenceResult } from "./inference-runner"
import { RuntimeEvent } from "@domain/runtime/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceRequest): Promise<InferenceResult>
	stream(requestParams: InferenceRequest): AsyncIterable<RuntimeEvent>
}
