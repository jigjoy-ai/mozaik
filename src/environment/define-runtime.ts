import { RuntimeService } from "@environment/runtime"
import { SituationHandler } from "@environment/situation-handler"
import { CreateParticipantUseCase } from "src/mozaik/use-cases/create-participant"
import { SharedMemory } from "./shared-memory"
import { UuidGenerator } from "@util/uuid-generator"

export function defineRuntime<TSharedMemory extends SharedMemory>() {
	let runtime: RuntimeService<TSharedMemory> | null = null

	function initializeRuntime(config: { model: TSharedMemory }): RuntimeService<TSharedMemory> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		runtime = new RuntimeService(config.model)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TSharedMemory> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	const createParticipantUseCase = new CreateParticipantUseCase(new UuidGenerator())

	const createParticipant = async (name: string, capabilities: readonly string[], handlers: SituationHandler[]) => {
		return await createParticipantUseCase.execute(name, capabilities, handlers)
	}

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
