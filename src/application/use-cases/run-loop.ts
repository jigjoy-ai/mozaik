import { RuntimeService } from "@app/services/runtime"
import { AgentLoop } from "@app/services/agent-loop"
import { FunctionCallState } from "@app/states/function-call"
import { InferenceState } from "@app/states/inference"
import { InferenceInput } from "@domain/agent-loop/inference"
import { MessageReceivedState } from "@app/states/message-received"
import { ModelMessageState } from "@app/states/model-message"
import { TransitionResolver } from "@domain/agent-loop/transition-resolver"
import {
	FunctionCallToInferenceRule,
	InferenceToFunctionCallRule,
	InferenceToModelMessageRule,
	ContextPreparationToInferenceRule,
	ModelMessageToIdleRule,
} from "@domain/agent-loop/transition-rule"
import { DomainModel } from "@domain/agentic-environment/runtime-state"
import { EventPublisherLoopVisitor } from "@app/services/event-publisher-visitor"
import { InferenceStreamingState } from "@app/states/inference-streaming"
import { InterceptionHandler } from "@domain/agent-loop/interception"
import { DefaultLoopStateExecutor } from "@app/services/state-executor"
import { createCloudClient } from "@mozaik-ai/cloud-sdk"

export function createRunLoop<TModel extends DomainModel>(resolveRuntime: () => RuntimeService<TModel>) {
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

		const stateExecutor = new DefaultLoopStateExecutor(
			new MessageReceivedState(),
			new InferenceState(inferenceRunner),
			new InferenceStreamingState(inferenceRunner),
			new FunctionCallState(functionCallRunner),
			new ModelMessageState(),
		)

		const agentLoop = AgentLoop.create(stateExecutor, transitionResolver, interceptionHandler)

		const cloudClient = createCloudClient()

		const loopVisitor = new EventPublisherLoopVisitor(agentId, agentLoop.getLoopId(), runtime, cloudClient)

		agentLoop.run(
			{
				content: message,
				input: inferenceInput,
			},
			loopVisitor,
		)
	}
}
