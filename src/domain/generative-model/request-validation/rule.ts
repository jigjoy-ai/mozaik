import type { InferenceInput } from "@domain/agent-loop/inference"
import type { ModelSpecification } from "../generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean
}
