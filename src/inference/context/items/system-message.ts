import { InputText } from "src/inference/context/items/item-content/input-text"
import { ContextItem } from "src/inference/context/item"

export class SystemMessageItem extends ContextItem {
	readonly type = "message"
	readonly role = "system"
	readonly content: InputText

	private constructor(content: InputText) {
		super()
		this.content = content
	}

	static create(text: string): SystemMessageItem {
		const content = InputText.create(text)
		return new SystemMessageItem(content)
	}

	static rehydrate(data: { text: string }): SystemMessageItem {
		const content = InputText.rehydrate(data)
		return new SystemMessageItem(content)
	}
}
