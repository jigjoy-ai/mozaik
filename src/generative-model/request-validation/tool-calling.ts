import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import { InferenceRequest } from "../inference-runner"

export class ToolUseRequestingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
