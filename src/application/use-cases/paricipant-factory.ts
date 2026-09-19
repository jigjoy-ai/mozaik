import { RuntimeService } from "@app/services/runtime"
import { ExternalParticipant } from "@domain/environment/participant/external-paricipant"
import { Participant } from "@domain/environment/participant/participant"
import { DomainModel } from "@domain/environment/runtime-state"
import { SituationHandler } from "@domain/environment/situation/situation-handler"

export function ParticipantFactory<TModel extends DomainModel>(resolveRuntime: () => RuntimeService<TModel>) {
	return function createParticipant(
		name: string,
		capabilities: readonly string[],
		handlers: SituationHandler[],
	): Participant {
		const participant = ExternalParticipant.create({ name, capabilities, handlers })
		return participant
	}
}
