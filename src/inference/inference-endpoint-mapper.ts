import type { InferenceRequest, InferenceResult } from "@inference/inference-runner"

export interface InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any
	toResponse(response: any): InferenceResult
}
