import type { InferenceInput } from "../inference-runner"
import type { RequestValidationRule } from "./rule"
import type { ModelSpecification } from "../generative-model"
import { ContextItem } from "@domain/generative-model/context/item"
import { UserMessageItem } from "@domain/generative-model/context/items/user-message"
import { SystemMessageItem } from "@domain/generative-model/context/items/system-message"
import { DeveloperMessageItem } from "@domain/generative-model/context/items/developer-message"
import { ModelMessageItem } from "@domain/generative-model/context/items/model-message"

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

	isValid(inferenceInput: InferenceInput, model: ModelSpecification): boolean {
		return inferenceInput.context.items.every((item) =>
			model.supportedContextItemTypes.includes(getContextItemValidationKey(item)),
		)
	}
}
