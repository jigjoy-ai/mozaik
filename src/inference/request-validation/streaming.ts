import type { ModelSpecification } from "src/inference/generative-model"
import type { RequestValidationRule } from "./rule"
import type { InferenceRequest } from "../inference-runner"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		if (!inferenceRequest.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
