export interface Operation {
	id: string
	invoke(input: unknown): Promise<unknown> | unknown
}
