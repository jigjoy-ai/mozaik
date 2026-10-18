export interface Directive<TInput = unknown> {
	id: string
	contractId: string
	input: TInput
}
