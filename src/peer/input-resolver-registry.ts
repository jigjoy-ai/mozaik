import { InputResolver } from "./input-resolver"

export class InputResolverRegistry {
	private resolvers: Record<string, InputResolver<any>> = {}

	register(id: string, resolver: InputResolver<any>): void {
		this.resolvers[id] = resolver
	}

	get(id: string): InputResolver<any> {
		return this.resolvers[id]
	}
}
