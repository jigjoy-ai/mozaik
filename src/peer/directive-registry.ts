import { Directive } from "./directive"

export class DirectiveRegistry {
	private directives: Map<string, Directive> = new Map()

	register(contractId: string, directive: Directive): void {
		this.directives.set(contractId, directive)
	}

	get(contractId: string): Directive | undefined {
		const directive = this.directives.get(contractId)
		return directive
	}
}
