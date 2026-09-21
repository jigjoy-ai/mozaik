import { Participant, ParticipantManifest } from "@environment/domain/participant"
import { SituationHandler } from "@environment/domain/situation-handler"

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
