import type { InferenceInput, InferenceOutput } from "@domain/agent-loop/inference"
import type { InferenceEndpointMapper } from "./inference-endpoint-mapper"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export interface Endpoint {
	endpointMapper: InferenceEndpointMapper
	infer(requestParams: InferenceInput): Promise<InferenceOutput>
	stream(requestParams: InferenceInput): AsyncIterable<SemanticEvent>
}
