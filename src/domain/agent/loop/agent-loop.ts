import { RuntimeEvent } from "@domain/runtime/event"
import { ContextItem } from "@domain/generative-model/context/item"
import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { ModelContext } from "@domain/generative-model/context/model-context"
import { InferenceOutput } from "@domain/generative-model/inference-runner"

export interface AgentLoop {
	beforeInference(context: ModelContext): Promise<BehaviorResult>

	afterInference(result: InferenceOutput, context: ModelContext): Promise<BehaviorResult>

	beforeToolCall(call: FunctionCallItem, context: ModelContext): Promise<BehaviorResult>

	afterToolCall(output: FunctionCallOutputItem, context: ModelContext): Promise<BehaviorResult>

	getLoopId(): string
}

interface BehaviorResult {
	contextItems?: ContextItem[]
	directive?: LoopDirective
	events?: RuntimeEvent[]
}

export interface LoopDirective {}
