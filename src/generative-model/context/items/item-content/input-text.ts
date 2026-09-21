import { ItemContent } from "src/runtime/domain/generative-model/context/items/item-content/item-content"

export class InputText extends ItemContent {
	readonly type = "input_text"

	private constructor(public readonly text: string) {
		super()
	}

	static create(text: string): InputText {
		return new InputText(text)
	}

	static rehydrate(data: { text: string }): InputText {
		return new InputText(data.text)
	}
}
