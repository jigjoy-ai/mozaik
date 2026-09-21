import type { InferenceRequest } from "../inference-runner"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import { ContextItem } from "src/inference/context/item"
import { UserMessageItem } from "src/inference/context/items/user-message"
import { SystemMessageItem } from "src/inference/context/items/system-message"
import { DeveloperMessageItem } from "src/inference/context/items/developer-message"
import { ModelMessageItem } from "src/inference/context/items/model-message"

function getContextItemValidationKey(item: ContextItem): string {
	if (item instanceof UserMessageItem) {
		return "user_message"
	}
	if (item instanceof SystemMessageItem) {
		return "system_message"
	}
	if (item instanceof DeveloperMessageItem) {
		return "developer_message"
	}
	if (item instanceof ModelMessageItem) {
		return "model_message"
	}
	return item.getType()
}

export class ContextValidation implements RequestValidationRule {
	readonly name = "context"

	isValid(inferenceRequest: InferenceRequest, model: ModelSpecification): boolean {
		return inferenceRequest.context.items.every((item) =>
			model.supportedContextItemTypes.includes(getContextItemValidationKey(item)),
		)
	}
}
