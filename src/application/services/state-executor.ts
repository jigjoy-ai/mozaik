import {
	ExecutableLoopStateId,
	LoopStateExecution,
	LoopStateExecutor,
	LoopTransition,
} from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"
import { FunctionCallState } from "@domain/agent/loop/states/function-call"
import { InferenceState } from "@domain/agent/loop/states/inference"
import { MessageReceivedState } from "@domain/agent/loop/states/message-received"
import { ModelMessageState } from "@domain/agent/loop/states/model-message"
import { InferenceStreamingState } from "@domain/agent/loop/states/inference-streaming"

export class DefaultLoopStateExecutor implements LoopStateExecutor {
	constructor(
		private readonly messageReceivedState: MessageReceivedState,
		private readonly inferenceState: InferenceState,
		private readonly inferenceStreamingState: InferenceStreamingState,
		private readonly functionCallState: FunctionCallState,
		private readonly modelMessageState: ModelMessageState,
	) {}

	execute(
		transition: LoopTransition<"message_received">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"message_received">>

	execute(transition: LoopTransition<"inference">, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"inference">>

	execute(
		transition: LoopTransition<"function_call">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"function_call">>

	execute(
		transition: LoopTransition<"model_message">,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution<"model_message">>

	execute(transition: LoopTransition<ExecutableLoopStateId>, loopVisitor: LoopVisitor): Promise<LoopStateExecution>

	async execute(
		transition: LoopTransition<ExecutableLoopStateId>,
		loopVisitor: LoopVisitor,
	): Promise<LoopStateExecution> {
		switch (transition.nextStateId) {
			case "message_received":
				return await this.messageReceivedState.run(transition.input, loopVisitor)

			case "inference":
				return await this.inferenceState.run(transition.input, loopVisitor)

			case "inference_streaming":
				return await this.inferenceStreamingState.run(transition.input, loopVisitor)

			case "function_call":
				return await this.functionCallState.run(transition.input, loopVisitor)

			case "model_message":
				return await this.modelMessageState.run(transition.input, loopVisitor)
		}
	}
}
