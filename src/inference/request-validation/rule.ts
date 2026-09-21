import type { InferenceRequest } from "@inference/inference-runner"
import type { ModelSpecification } from "@inference/generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean
}
