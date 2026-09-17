import { RuntimeService } from "@app/services/runtime"
import { ExternalParticipant } from "@domain/agentic-environment/participant/external-paricipant"
import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { SituationHandler } from "@domain/agentic-environment/situation/situation-handler"

export function ParticipantFactory<TRuntimeState extends RuntimeState>(
	resolveRuntime: () => RuntimeService<TRuntimeState>,
) {
	return function createParticipant(
		name: string,
		capabilities: readonly string[],
		handlers: SituationHandler[],
	): Participant {
		const participant = ExternalParticipant.create({ name, capabilities, handlers })
		return participant
	}
}
