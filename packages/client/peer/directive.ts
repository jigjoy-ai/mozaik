export interface Directive {
	id: string
	invoke(input: unknown): Promise<unknown> | unknown
}
