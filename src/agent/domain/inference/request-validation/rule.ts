import type { InferenceRequest } from "@agent/domain/inference/inference-runner"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean
}
