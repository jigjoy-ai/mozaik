import { ParticipantManifest } from "../participant/participant"

export class SemanticEvent<TType extends string = string, TPayload = unknown> {
	readonly type: TType
	readonly producerId: string
	readonly occurredAt: Date
	readonly payload: TPayload

	constructor(type: TType, producerId: string, occurredAt: Date, payload: TPayload) {
		this.type = type
		this.producerId = producerId
		this.occurredAt = occurredAt
		this.payload = payload
	}

	static create<TType extends string = string, TPayload = unknown>(
		type: TType,
		producerId: string,
		payload: TPayload,
	): SemanticEvent<TType, TPayload> {
		const occurredAt = new Date()
		return new SemanticEvent(type, producerId, occurredAt, payload)
	}
}

export class ParticipantJoinedEvent extends SemanticEvent<"participant.joined", ParticipantManifest> {
	static init(manifest: ParticipantManifest): ParticipantJoinedEvent {
		return SemanticEvent.create("participant.joined", manifest.id, manifest)
	}
}

export class ParticipantLeftEvent extends SemanticEvent<"participant.left", ParticipantManifest> {
	static init(manifest: ParticipantManifest): ParticipantLeftEvent {
		return SemanticEvent.create("participant.left", manifest.id, manifest)
	}
}

export class MessageSentEvent extends SemanticEvent<"message.sent", { message: string }> {
	static init(producerId: string, message: string): MessageSentEvent {
		return SemanticEvent.create("message.sent", producerId, { message })
	}
}

export class ModelAnswerEvent extends SemanticEvent<"model.answer", { answer: string }> {
	static init(producerId: string, answer: string): ModelAnswerEvent {
		return ModelAnswerEvent.create("model.answer", producerId, { answer })
	}
}
