import type { InferenceRequest } from "@agent/inference/inference-runner"
import type { ModelSpecification } from "@agent/inference/generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean
}
