import { Participant, ParticipantManifest } from "./participant"
import { SituationHandler } from "../situation/situation-handler"

export class ExternalParticipant extends Participant {
	private collaborators: Participant[] = []

	constructor(manifest: ParticipantManifest, handlers: SituationHandler[]) {
		super(manifest, handlers)
	}

	participantJoined(participant: Participant): void {
		if (this.getId() === participant.getId()) {
			return
		}

		this.collaborators.push(participant)
	}

	participantLeft(participant: Participant): void {
		if (this.getId() === participant.getId()) {
			return
		}

		this.collaborators = this.collaborators.filter((p) => p.getId() !== participant.getId())
	}

	getCollaborators(): Participant[] {
		return this.collaborators
	}

	static create({
		name,
		capabilities,
		handlers,
	}: {
		name: string
		capabilities: readonly string[]
		handlers: SituationHandler[]
	}): ExternalParticipant {
		const id = crypto.randomUUID()
		const manifest: ParticipantManifest = { id, name, capabilities, role: "human" }
		return new ExternalParticipant(manifest, handlers)
	}
}
