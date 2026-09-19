import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import { InferenceInput } from "../inference-runner"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean {
		if (inferenceInput.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(inferenceInput.reasoningEffort)
	}
}
