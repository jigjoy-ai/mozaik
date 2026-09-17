import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@domain/agentic-environment/loop/agent-loop"
import { LoopStateExecutor } from "@domain/agentic-environment/loop/state-executor"
import { FunctionCallState } from "@app/states/function-call"
import { InferenceInput, InferenceState } from "@app/states/inference"
import { MessageReceivedState } from "@app/states/message-received"
import { ModelMessageState } from "@app/states/model-message"
import { TransitionResolver } from "@domain/agentic-environment/loop/transition-resolver"
import {
	FunctionCallToInferenceRule,
	InferenceToFunctionCallRule,
	InferenceToModelMessageRule,
	ContextPreparationToInferenceRule,
	ModelMessageToIdleRule,
} from "@domain/agentic-environment/loop/transition-rule"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventPublisherLoopVisitor } from "@app/services/event-publisher-visitor"
import { InferenceStreamingState } from "@app/states/inference-streaming"
import { InterceptionHandler } from "@domain/agentic-environment/loop/interception"

export function createRunLoop<TRuntimeState extends RuntimeState>(resolveRuntime: () => RuntimeService<TRuntimeState>) {
	return function runLoop(
		agentId: string,
		message: string,
		inferenceInput: InferenceInput,
		interceptionHandler?: InterceptionHandler,
	) {
		const runtime = resolveRuntime()
		const inferenceRunner = runtime.getInferenceRunner()
		const functionCallRunner = runtime.getFunctionCallRunner()

		const transitionResolver = new TransitionResolver([
			// High-priority interception rules would go first.
			new ContextPreparationToInferenceRule(),
			new InferenceToFunctionCallRule(),
			new InferenceToModelMessageRule(),
			new FunctionCallToInferenceRule(),
			new ModelMessageToIdleRule(),
		])

		const stateExecutor = new LoopStateExecutor(
			new MessageReceivedState(),
			new InferenceState(inferenceRunner),
			new InferenceStreamingState(inferenceRunner),
			new FunctionCallState(functionCallRunner),
			new ModelMessageState(),
		)

		const agentLoop = AgentLoop.create(stateExecutor, transitionResolver, interceptionHandler)

		const loopVisitor = new EventPublisherLoopVisitor(agentId, agentLoop.getLoopId(), runtime)

		agentLoop.run(
			{
				content: message,
				input: inferenceInput,
			},
			loopVisitor,
		)
	}
}
