import type { InferenceRequest } from "../inference-runner"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import type { ContextItem } from "src/inference/context"

function getContextItemValidationKey(item: ContextItem): string {
	if (item.type === "user_message") {
		return "user_message"
	}
	if (item.type === "system_message") {
		return "system_message"
	}
	if (item.type === "developer_message") {
		return "developer_message"
	}
	if (item.type === "model_message") {
		return "model_message"
	}
	return item.type
}

export class ContextValidation implements RequestValidationRule {
	readonly name = "context"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		return inferenceRequest.context.items.every((item) =>
			model.supportedContextItemTypes.includes(getContextItemValidationKey(item)),
		)
	}
}
