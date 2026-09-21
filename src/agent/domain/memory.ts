import { ModelContext } from "src/inference/context"

export class Memory {
	private readonly context: ModelContext
	private constructor(context: ModelContext) {
		this.context = context
	}

	getContext(): ModelContext {
		return this.context
	}

	static create(): Memory {
		const context: ModelContext = {
			items: [],
		}
		return new Memory(context)
	}
}
