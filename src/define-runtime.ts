import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import { createJoin } from "./application/use-cases/join"
import { createLeave } from "./application/use-cases/leave"
import { createSendMessage } from "./application/use-cases/send-message"
import { createRunLoop } from "@app/use-cases/run-loop"
import { InferenceRunner } from "@domain/agentic-environment/loop/inference"
import { supportedModels } from "@app/services/models"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceInputValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { DefaultInferenceRunner } from "@app/services/inference-runner"
import { DefaultFunctionCallRunner } from "@app/services/function-call"
import { createSendEvent } from "@app/use-cases/send-event"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export function defineRuntime<TRuntimeState extends RuntimeState>() {
	let runtime: RuntimeService<TRuntimeState> | null = null
	const processor = new EventProcessor()

	function initializeRuntime(config: {
		state: TRuntimeState
		inferenceRunnerConfig?: InferenceRunnerConfig
	}): RuntimeService<TRuntimeState> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		const inferenceRunner =
			config.inferenceRunnerConfig?.runner ??
			new DefaultInferenceRunner(
				config.inferenceRunnerConfig?.supportedModels ?? supportedModels,
				new InferenceInputValidator(),
			)

		const functionCallRunner = new DefaultFunctionCallRunner()

		runtime = new RuntimeService(config.state, processor, inferenceRunner, functionCallRunner)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TRuntimeState> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	function resolveParticipant(id: string): Participant {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		const participant = runtime.state.getParticipant(id)

		if (!participant) {
			throw new Error(`Participant ${id} not found`)
		}

		return participant
	}

	const join = createJoin(resolveRuntime)
	const leave = createLeave(resolveRuntime)
	const sendMessage = createSendMessage(resolveRuntime)
	const sendEvent = createSendEvent(resolveRuntime)
	const runLoop = createRunLoop(resolveRuntime)

	return {
		initializeRuntime,
		resolveRuntime,
		resolveParticipant,
		join,
		leave,
		sendMessage,
		sendEvent,
		runLoop,
	}
}
