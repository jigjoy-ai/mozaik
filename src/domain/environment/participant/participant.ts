import { SituationHandler } from "../situation/situation-handler"

export type ParticipantRole = "agent" | "human"

export type ParticipantManifest = {
	readonly id: string
	readonly name: string
	readonly role: ParticipantRole
	readonly capabilities?: readonly string[]
}

export abstract class Participant {
	private readonly manifest: ParticipantManifest
	private handlers: SituationHandler[]

	protected constructor(manifest: ParticipantManifest, handlers: SituationHandler[]) {
		this.manifest = manifest
		this.handlers = handlers
	}

	getManifest(): ParticipantManifest {
		return this.manifest
	}

	getId(): string {
		return this.manifest.id
	}

	getHandlers(): SituationHandler[] {
		return this.handlers
	}

	setHandlers(handlers: SituationHandler[]): void {
		this.handlers = handlers
	}

	abstract participantJoined(participant: Participant): void

	abstract participantLeft(participant: Participant): void
}
