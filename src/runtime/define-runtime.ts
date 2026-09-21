import { RuntimeService } from "src/runtime/application/services/runtime"
import { DomainModel } from "src/runtime/domain/runtime/domain-model"
import { InferenceRunner } from "src/inference/inference-runner"
import { supportedModels } from "src/runtime/application/services/models"
import { GenerativeModel } from "src/inference/generative-model"
import { InferenceRequestValidator } from "src/inference/request-validation/inference-request-validator"
import { DefaultInferenceRunner } from "src/agent/application/services/inference-runner"
import { LocalToolRunner } from "src/agent/application/services/local-tool-runner"
import { SituationHandler } from "src/runtime/domain/runtime/situation-handler"
import { CreateParticipantUseCase } from "src/runtime/application/use-cases/create-participant"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export function defineRuntime<TModel extends DomainModel>() {
	let runtime: RuntimeService<TModel> | null = null

	function initializeRuntime(config: {
		model: TModel
		inferenceRunnerConfig?: InferenceRunnerConfig
	}): RuntimeService<TModel> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		const inferenceRunner =
			config.inferenceRunnerConfig?.runner ??
			new DefaultInferenceRunner(
				config.inferenceRunnerConfig?.supportedModels ?? supportedModels,
				new InferenceRequestValidator(),
			)

		const toolUseRunner = new LocalToolRunner()

		runtime = new RuntimeService(config.model, inferenceRunner, toolUseRunner)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TModel> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	const createParticipantUseCase = new CreateParticipantUseCase()

	const createParticipant = async (name: string, capabilities: readonly string[], handlers: SituationHandler[]) => {
		return await createParticipantUseCase.execute(name, capabilities, handlers)
	}

	// const join = () => async (participant: Participant) => {
	// 	resolveRuntime().join(participant)
	// }
	// const leave = () => async (participant: Participant) => {
	// 	resolveRuntime().leave(participant)
	// }
	// const sendMessage = createSendMessage(resolveRuntime)
	// const sendEvent = createSendEvent(resolveRuntime)

	return {
		initializeRuntime,
		resolveRuntime,
		createParticipant,
		// join,
		// leave,
		// sendMessage,
		// sendEvent,
	}
}
