import type { ContextItem } from "@domain/generative-model/context/item"
import { ToolUseRequest } from "@domain/generative-model/context/items/tool-use-request"
import { ModelMessageItem } from "@domain/generative-model/context/items/model-message"
import { ReasoningItem } from "@domain/generative-model/context/items/reasoning"

export type ModelContextItem = ModelMessageItem | ToolUseRequest | ReasoningItem

export class ModelContext {
	readonly id: string
	readonly items: ContextItem[]

	constructor(id: string, items: ContextItem[]) {
		this.id = id
		this.items = items
	}

	getItems(): ContextItem[] {
		return this.items
	}

	addContextItems(contextItems: ContextItem[]): ModelContext {
		this.items.push(...contextItems)
		return this
	}

	addContextItem(item: ContextItem): ModelContext {
		this.items.push(item)
		return this
	}

	static create(): ModelContext {
		const id = crypto.randomUUID()
		return new ModelContext(id, [])
	}

	static rehydrate(data: { id: string; items: ContextItem[] }): ModelContext {
		return new ModelContext(data.id, data.items)
	}
}
