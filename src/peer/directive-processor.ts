import { OperationRegistry } from "@peer/operation-registry"
import { Directive } from "./directive"
import { DirectiveResult } from "./directive-result"

export class DirectiveProcessor {
	constructor(private readonly operationRegistry: OperationRegistry) {}

	async process(directive: Directive, operationId: string): Promise<DirectiveResult | undefined> {
		const operation = this.operationRegistry.get(operationId)
		if (!operation) {
			return undefined
		}
		const output = await operation.invoke(directive.input)
		return {
			directiveId: directive.id,
			output: output,
		}
	}
}
