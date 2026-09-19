import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"
import { InferenceInput } from "@domain/agent/loop/states/inference"
import { InferenceOutput } from "@domain/agent/loop/states/inference"
import { SemanticEvent } from "@domain/environment/semantic-event/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceInput): Promise<InferenceOutput>
	stream(requestParams: InferenceInput): AsyncIterable<SemanticEvent>
}
