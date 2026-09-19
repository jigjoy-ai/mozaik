import type { InferenceInput, InferenceOutput } from "./inference-runner"

export interface InferenceEndpointMapper {
	toRequest(inferenceInput: InferenceInput): any
	toResponse(response: any): InferenceOutput
}
