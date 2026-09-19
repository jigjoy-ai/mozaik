import type { InferenceInput } from "../inference-runner"
import type { ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean
}
