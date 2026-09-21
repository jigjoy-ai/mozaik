import type { InferenceRequest } from "../inference-runner"
import type { ModelSpecification } from "../generative-model"
import type { RequestValidationRule } from "./rule"
import { ReasoningEffortValidation } from "./reasoning-effort"
import { ToolUseRequestingValidation } from "./tool-calling"
import { StreamingValidation } from "./streaming"
import { StructuredOutputValidation } from "./structured-output"
import { ContextValidation } from "./context"

export const defaultRequestValidationRules: RequestValidationRule[] = [
	new ReasoningEffortValidation(),
	new ToolUseRequestingValidation(),
	new StreamingValidation(),
	new StructuredOutputValidation(),
	new ContextValidation(),
]

export class InferenceRequestValidator {
	constructor(private readonly rules: RequestValidationRule[] = defaultRequestValidationRules) {}

	validate(inferenceRequest: InferenceRequest, model: ModelSpecification): void {
		for (const rule of this.rules) {
			if (!rule.isValid(inferenceRequest, model)) {
				throw new Error(`Request validation "${rule.name}" failed for model "${model.name}"`)
			}
		}
	}
}
