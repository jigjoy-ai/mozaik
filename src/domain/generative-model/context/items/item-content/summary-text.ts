import { ItemContent } from "@domain/generative-model/context/items/item-content/item-content"

export class SummaryText extends ItemContent {
	readonly type = "summary_text"

	private constructor(public readonly text: string) {
		super()
	}

	static rehydrate(data: { text: string }): SummaryText {
		return new SummaryText(data.text)
	}
}
