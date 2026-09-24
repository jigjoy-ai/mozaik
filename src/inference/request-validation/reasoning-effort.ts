import type { RequestValidationRule } from "@inference/request-validation/rule"
import type { ModelSpecification } from "@inference/generative-model"
import { InferenceRequest } from "@inference/inference-runner"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (inferenceRequest.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(inferenceRequest.reasoningEffort)
	}
}
