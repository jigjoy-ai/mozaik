import type { ModelSpecification } from "@inference/generative-model"
import type { RequestValidationRule } from "@inference/request-validation/rule"
import type { InferenceRequest } from "@inference/inference-runner"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (!inferenceRequest.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
