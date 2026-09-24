import { SharedMemory } from "@environment/shared-memory"

export class RuntimeService<TSharedMemory extends SharedMemory> {
	constructor(public readonly sharedMemory: TSharedMemory) {}
}
