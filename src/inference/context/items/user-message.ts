import { ContextItem } from "src/runtime/domain/generative-model/context/item"
import { InputText } from "src/runtime/domain/generative-model/context/items/item-content/input-text"

export class UserMessageItem extends ContextItem {
	readonly type = "message"
	readonly role = "user"
	readonly content: InputText

	private constructor(content: InputText) {
		super()
		this.content = content
	}

	static create(text: string): UserMessageItem {
		const content = InputText.create(text)
		return new UserMessageItem(content)
	}

	static rehydrate(data: { text: string }): UserMessageItem {
		const content = InputText.rehydrate(data)
		return new UserMessageItem(content)
	}
}
