import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"
import { InferenceInput, InferenceOutput } from "./inference-runner"
import { SemanticEvent } from "@domain/environment/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceInput): Promise<InferenceOutput>
	stream(requestParams: InferenceInput): AsyncIterable<SemanticEvent>
}
