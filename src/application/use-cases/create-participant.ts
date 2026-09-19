import { Participant, ParticipantManifest } from "@domain/environment/participant"
import { SituationHandler } from "@domain/environment/situation-handler"

export class CreateParticipantUseCase {
	async execute(name: string, capabilities: readonly string[], handlers: SituationHandler[]): Promise<Participant> {
		const manifest: ParticipantManifest = {
			id: crypto.randomUUID(),
			name,
			capabilities,
			role: "external",
		}
		const participant = new Participant(manifest, handlers)
		return participant
	}
}
