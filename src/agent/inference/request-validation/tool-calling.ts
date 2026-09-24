import type { RequestValidationRule } from "@agent/inference/request-validation/rule"
import type { ModelSpecification } from "@agent/inference/generative-model"
import { InferenceRequest } from "@agent/inference/inference-runner"

export class ToolUseRequestingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
