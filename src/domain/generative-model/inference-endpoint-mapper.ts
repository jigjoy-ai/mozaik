import type { InferenceInput, InferenceOutput } from "@domain/agent-loop/states/inference"

export interface InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput): any
	toResponse(response: any): InferenceOutput
}
