import type { ModelSpecification } from "@domain/generative-model/generative-model"
import type { RequestValidationRule } from "./rule"
import type { InferenceInput } from "@domain/agent-loop/inference"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean {
		if (!inferenceInput.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
