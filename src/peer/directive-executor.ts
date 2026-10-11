import { Directive } from "./directive"
import { DirectiveResult } from "./directive-result"

export interface DirectiveExecutor<TInput, TOutput> {
	execute(directive: Directive<TInput>, operation: Operation): Promise<DirectiveResult>
}
