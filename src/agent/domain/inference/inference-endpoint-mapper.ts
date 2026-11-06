import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import type { InferenceResult } from "@agent/domain/inference/inference-result"

export interface InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any
	toResponse(response: any): InferenceResult
}
