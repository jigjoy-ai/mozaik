import type { InferenceRequest } from "@agent/inference/inference-runner"
import type { ModelSpecification } from "@agent/inference/generative-model"
import type { RequestValidationRule } from "@agent/inference/request-validation/rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
