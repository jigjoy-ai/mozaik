import { SharedMemory } from "@environment/domain/shared-memory"

export class RuntimeService<TSharedMemory extends SharedMemory> {
	constructor(public readonly sharedMemory: TSharedMemory) {}
}
