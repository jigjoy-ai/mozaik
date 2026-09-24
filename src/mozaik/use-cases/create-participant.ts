import { Participant, ParticipantManifest } from "@environment/participant"
import { SituationHandler } from "@environment/situation-handler"
import { IdGenerator } from "@util/id-generator"

export class CreateParticipantUseCase {
	constructor(private readonly idGenerator: IdGenerator) {}

	async execute(name: string, capabilities: readonly string[], handlers: SituationHandler[]): Promise<Participant> {
		const manifest: ParticipantManifest = {
			id: this.idGenerator.generate(),
			name,
			capabilities,
			role: "external",
		}
		const participant = new Participant(manifest, handlers)
		return participant
	}
}
