import type { InferenceRequest } from "@agent/domain/inference/inference-runner"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"

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
