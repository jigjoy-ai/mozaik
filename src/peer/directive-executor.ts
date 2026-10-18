import { OperationRegistry } from "@peer/operation-registry"
import { Directive } from "./directive"
import { DirectiveResult } from "./directive-result"

export class DirectiveExecutor {
	constructor(private readonly operationRegistry: OperationRegistry) {}

	async execute(directive: Directive, operationId: string): Promise<DirectiveResult> {
		const operation = this.operationRegistry.get(operationId)
		if (!operation) {
			throw new Error(`Operation with id ${operationId} not found`)
		}
		const output = await operation.invoke(directive.input)
		return {
			directiveId: directive.id,
			output: output,
		}
	}
}
