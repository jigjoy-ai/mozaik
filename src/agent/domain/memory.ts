import type { ContextItem } from "@agent/domain/inference/context"

export interface Memory {
	remember(items: ContextItem[], peerId: string): Promise<void>
	recall(topic: string, peerId: string): Promise<ContextItem[]>
}

export interface MemoryFactory {
	create(): Memory
}
