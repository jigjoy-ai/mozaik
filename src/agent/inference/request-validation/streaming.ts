import type { ModelSpecification } from "@agent/inference/generative-model"
import type { RequestValidationRule } from "@agent/inference/request-validation/rule"
import type { InferenceRequest } from "@agent/inference/inference-runner"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (!inferenceRequest.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
