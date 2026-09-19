import type { InferenceInput } from "@domain/agent/loop/states/inference"
import type { ModelSpecification } from "../generative-model"
import type { RequestValidationRule } from "./rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean {
		if (inferenceInput.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
