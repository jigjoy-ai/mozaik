import { Participant, ParticipantManifest } from "src/runtime/domain/runtime/participant"
import { SituationHandler } from "src/runtime/domain/runtime/situation-handler"

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
