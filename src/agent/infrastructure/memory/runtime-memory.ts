import type { Memory } from "@agent/domain/memory"
import type { Context, ContextItem } from "@inference/context"

export class RuntimeMemory implements Memory {
	private readonly context: Context

	constructor(context: Context) {
		this.context = context
	}
	async remember(items: ContextItem[], _participantId: string): Promise<void> {
		this.context.items.push(...items)
	}
	async recall(_topic: string, _participantId: string): Promise<ContextItem[]> {
		return this.context.items
	}
}
