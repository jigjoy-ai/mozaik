import { RuntimeService } from "src/environment/application/services/runtime"
import { DomainModel } from "src/environment/domain/runtime/domain-model"
import { SituationHandler } from "src/environment/domain/runtime/situation-handler"
import { CreateParticipantUseCase } from "src/environment/application/use-cases/create-participant"

export function defineRuntime<TModel extends DomainModel>() {
	let runtime: RuntimeService<TModel> | null = null

	function initializeRuntime(config: { model: TModel }): RuntimeService<TModel> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		runtime = new RuntimeService(config.model)

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
