import { ContextItem } from "src/inference/context/item"
import { OutputText } from "src/inference/context/items/item-content/output-text"

export class ModelMessageItem extends ContextItem {
	readonly type = "message"
	readonly role = "assistant"
	readonly content: OutputText

	private constructor(content: OutputText) {
		super()
		this.content = content
	}

	static rehydrate(data: { text: string }): ModelMessageItem {
		const content = OutputText.rehydrate(data)
		return new ModelMessageItem(content)
	}
}
