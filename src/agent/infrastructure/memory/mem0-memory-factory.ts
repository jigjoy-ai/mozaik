import type { Memory, MemoryFactory } from "@agent/domain/memory"
import { Mem0Memory } from "@agent/infrastructure/memory/mem0-memory"

export class Mem0Factory implements MemoryFactory {
    create(): Memory {
        return new Mem0Memory()
    }
}