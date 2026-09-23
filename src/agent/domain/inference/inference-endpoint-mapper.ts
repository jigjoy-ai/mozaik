import type { InferenceRequest, InferenceResult } from "@agent/domain/inference/inference-runner"

export interface InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any
	toResponse(response: any): InferenceResult
}
