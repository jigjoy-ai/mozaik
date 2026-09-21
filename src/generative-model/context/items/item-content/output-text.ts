import { ItemContent } from "src/runtime/domain/generative-model/context/items/item-content/item-content"

export class OutputText extends ItemContent {
	readonly type = "output_text"

	private constructor(public readonly text: string) {
		super()
	}

	static rehydrate(data: { text: string }): OutputText {
		return new OutputText(data.text)
	}
}
