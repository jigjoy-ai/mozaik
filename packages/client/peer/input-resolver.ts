export interface InputResolver<I, R> {
	resolve(input: I): Promise<R>
}
