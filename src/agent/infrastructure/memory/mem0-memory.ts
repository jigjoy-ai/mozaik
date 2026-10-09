import type { Memory } from "@agent/domain/memory"
import type { ContextItem } from "@inference/context"

import MemoryClient from "mem0ai"

type Mem0Message = {
    role: "user" | "assistant"
    content: string
}

export class Mem0Memory implements Memory {
    private readonly client: MemoryClient

    constructor() {
        this.client = new MemoryClient({
            apiKey: process.env.MEM0_API_KEY,
        })
    }

    async remember(
        items: ContextItem[],
        participantId: string
    ): Promise<void> {
        const messages: Mem0Message[] = []

        for (const item of items) {
            if (!("text" in item) || !item.text) {
                continue
            }

            if (item.type === "user_message") {
                messages.push({
                    role: "user",
                    content: item.text,
                })

                continue
            }

            if (item.type === "model_message") {
                messages.push({
                    role: "assistant",
                    content: item.text,
                })
            }
        }

        if (messages.length === 0) {
            return
        }

        await this.client.add(messages, {
            userId: participantId,
        })
    }

    async recall(
        topic: string,
        participantId: string
    ): Promise<ContextItem[]> {
        const result = await this.client.search(topic, {
            filters: {
                user_id: participantId,
            },
        })

        const items: ContextItem[] = []

        for (const memory of result.results) {
            if (!memory.memory) {
                continue
            }

            items.push({
                type: "user_message",
                text: memory.memory,
            })
        }

        return items
    }
}