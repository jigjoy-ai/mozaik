import type { ContextItem } from "@inference/context"

export interface Memory {
	remember(items: ContextItem[], participantId: string): Promise<void>
	recall(topic: string, participantId: string): Promise<ContextItem[]>
}

export interface MemoryFactory {
	create(): Memory
}
