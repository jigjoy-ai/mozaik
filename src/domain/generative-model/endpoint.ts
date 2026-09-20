import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"
import { InferenceInput, InferenceOutput } from "./inference-runner"
import { RuntimeEvent } from "@domain/runtime/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceInput): Promise<InferenceOutput>
	stream(requestParams: InferenceInput): AsyncIterable<RuntimeEvent>
}
