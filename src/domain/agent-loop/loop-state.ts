import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { LoopVisitor } from "./loop-visitor"
import { InterceptionOutput, InterceptionParams } from "./interception"
import { InferenceInput, InferenceOutput } from "./inference"
import { FunctionCallParams } from "./function-call"

export type LoopStateId =
	| "message_received"
	| "inference"
	| "inference_streaming"
	| "function_call"
	| "model_message"
	| "idle"

export type ReceivedMessage = {
	content: string
	input: InferenceInput
}

export interface FunctionCallExecutionOutput {
	item: FunctionCallOutputItem
}

export interface ModelMessageParams {
	answer: ModelMessageItem
}

// ============================================================
// State contracts
// ============================================================

export interface LoopStateContract {
	message_received: {
		input: ReceivedMessage
		output: InferenceInput
	}

	inference: {
		input: InferenceInput
		output: InferenceOutput
	}

	inference_streaming: {
		input: InferenceInput
		output: InferenceOutput
	}

	function_call: {
		input: FunctionCallParams
		output: FunctionCallExecutionOutput
	}

	model_message: {
		input: ModelMessageParams
		output: void
	}

	interception: {
		input: InterceptionParams
		output: InterceptionOutput
	}

	idle: {
		input: undefined
		output: void
	}
}

export type ExecutableLoopStateId = Exclude<LoopStateId, "idle">
export type ExecutableTransition = LoopTransition<ExecutableLoopStateId>

// ============================================================
// State execution
// ============================================================

export interface LoopState<TInput, TOutput> {
	readonly id: LoopStateId

	run(input: TInput, visitor: LoopVisitor): Promise<TOutput>
}

export type LoopStateExecution<TStateId extends ExecutableLoopStateId = ExecutableLoopStateId> = {
	[K in TStateId]: {
		stateId: K
		input: LoopStateContract[K]["input"]
		output: LoopStateContract[K]["output"]
	}
}[TStateId]

// ============================================================
// Loop transition
// ============================================================

export type LoopTransition<TStateId extends LoopStateId = LoopStateId> = {
	[K in TStateId]: {
		nextStateId: K
		input: LoopStateContract[K]["input"]
	}
}[TStateId]

export interface LoopStateExecutor {
	execute(transition: LoopTransition<ExecutableLoopStateId>, loopVisitor: LoopVisitor): Promise<LoopStateExecution>
}
