export abstract class ContextItem {
	abstract readonly type: string

	getType(): string {
		return this.type
	}
}
