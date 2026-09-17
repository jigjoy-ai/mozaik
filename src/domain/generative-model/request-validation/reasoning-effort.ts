import type { InferenceInput } from "@domain/agent-loop/inference"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"

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
