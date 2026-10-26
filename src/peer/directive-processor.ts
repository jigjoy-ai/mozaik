import { DirectiveRegistry } from "@peer/directive-registry"
import { DirectiveDefinition } from "./directive-definition"
import { DirectiveResult } from "./directive-result"

export class DirectiveProcessor {
	constructor(private readonly directiveRegistry: DirectiveRegistry) {}

	async process(directiveDefinition: DirectiveDefinition<unknown>): Promise<DirectiveResult<unknown> | undefined> {
		const directive = this.directiveRegistry.get(directiveDefinition.id)
		if (!directive) {
			return undefined
		}
		const result = await directive.invoke(directiveDefinition.input)
		return {
			directiveId: directive.id,
			result: result,
		}
	}
}
