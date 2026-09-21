import type { InputText } from "src/inference/context/items/item-content/input-text"
import type { SummaryText } from "src/inference/context/items/item-content/summary-text"
import { ContextItem } from "src/inference/context/item"

export class ReasoningItem extends ContextItem {
	readonly type = "reasoning"
	readonly content: InputText | undefined
	readonly encryptedContent: string | undefined
	readonly summary: SummaryText[]

	private constructor(
		content: InputText | undefined,
		encryptedContent?: string | undefined,
		summary: SummaryText[] = [],
	) {
		super()
		this.content = content
		this.encryptedContent = encryptedContent
		this.summary = summary
	}

	static rehydrate(data: {
		content: InputText | undefined
		encryptedContent: string | undefined
		summary: SummaryText[]
	}): ReasoningItem {
		return new ReasoningItem(data.content, data.encryptedContent, data.summary)
	}
}
