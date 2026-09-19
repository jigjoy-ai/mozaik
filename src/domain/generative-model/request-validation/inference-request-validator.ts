import type { InferenceInput } from "../inference-runner"
import type { ModelSpecification } from "../generative-model"
import type { RequestValidationRule } from "./rule"
import { ReasoningEffortValidation } from "./reasoning-effort"
import { ToolCallingValidation } from "./tool-calling"
import { StreamingValidation } from "./streaming"
import { StructuredOutputValidation } from "./structured-output"
import { ContextValidation } from "./context"

export const defaultRequestValidationRules: RequestValidationRule[] = [
	new ReasoningEffortValidation(),
	new ToolCallingValidation(),
	new StreamingValidation(),
	new StructuredOutputValidation(),
	new ContextValidation(),
]

export class InferenceInputValidator {
	constructor(private readonly rules: RequestValidationRule[] = defaultRequestValidationRules) {}

	validate(inferenceInput: InferenceInput, model: ModelSpecification): void {
		for (const rule of this.rules) {
			if (!rule.isValid(inferenceInput, model)) {
				throw new Error(`Request validation "${rule.name}" failed for model "${model.name}"`)
			}
		}
	}
}
