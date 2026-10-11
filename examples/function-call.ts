// export interface Situation {
// 	readonly condition: Condition
// 	readonly action: Action
// }

import { Directive } from "./directive"
import { DirectiveExecutor } from "./directive-executor"
import { DirectiveResult } from "./directive-result"

// export interface DirectiveExecutorRegistry<TInput, TOutput> {
// 	register(directive: Directive): DirectiveExecutor<TInput, TOutput>
// 	get(directive: Directive): DirectiveExecutor<TInput, TOutput>
// 	list(): DirectiveExecutor<TInput, TOutput>[]
// }

export interface FunctionCallInput {
	name: string
	arguments: Record<string, unknown>
}

export interface FunctionCall extends Directive<FunctionCallInput> {
	id: string
	type: "function"
	input: FunctionCallInput
}

export type FunctionCallOutput = unknown
export interface FunctionCallResult extends DirectiveResult<FunctionCallOutput> {
	directiveId: string
	output: FunctionCallOutput
}

export type FunctionCallExecutor = DirectiveExecutor<FunctionCallInput, FunctionCallOutput>

export class SendEmailOperation implements Operation {
	async invoke({ subject, body, to }: { subject: string; body: string; to: string }): Promise<{ success: boolean }> {
		// TODO: Implement send email logic
		return {
			success: true,
		}
	}
}

export class LocalFunctionCallExecutor implements FunctionCallExecutor {
	async execute(directive: FunctionCall, operation: Operation): Promise<FunctionCallResult> {
		const output = await operation.invoke(directive.input.arguments)
		return {
			directiveId: directive.id,
			output: output,
		}
	}
}
