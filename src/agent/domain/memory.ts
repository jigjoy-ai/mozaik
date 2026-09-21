import { ModelContext } from "src/runtime/domain/generative-model/context/model-context"

export class Memory {
	private readonly context: ModelContext
	private constructor(context: ModelContext) {
		this.context = context
	}

	getContext(): ModelContext {
		return this.context
	}

	static create(): Memory {
		const context = ModelContext.create()
		return new Memory(context)
	}
}
