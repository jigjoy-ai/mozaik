import { InputResolver } from "./input-resolver"

export class InputResolverRegistry {
	private resolvers: Record<string, InputResolver<any, any>> = {}

	register(id: string, resolver: InputResolver<any, any>): void {
		this.resolvers[id] = resolver
	}

	get(id: string): InputResolver<any, any> {
		return this.resolvers[id]
	}
}
