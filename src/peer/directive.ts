import { DirectiveContract } from "./directive-contract"

export interface Directive<TInput = unknown> {
	id: string
	definition: DirectiveContract
	input: TInput
}
