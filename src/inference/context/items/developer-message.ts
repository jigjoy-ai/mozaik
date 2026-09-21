import { InputText } from "src/inference/context/items/item-content/input-text"
import { ContextItem } from "src/inference/context/item"

export class DeveloperMessageItem extends ContextItem {
	readonly type = "message"
	readonly role = "developer"
	readonly content: InputText

	private constructor(content: InputText) {
		super()
		this.content = content
	}

	static create(text: string): DeveloperMessageItem {
		const content = InputText.create(text)
		return new DeveloperMessageItem(content)
	}

	static rehydrate(data: { text: string }): DeveloperMessageItem {
		const content = InputText.rehydrate(data)
		return new DeveloperMessageItem(content)
	}
}
