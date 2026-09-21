import { ParticipantManifest } from "@environment/domain/participant"

export class RuntimeEvent<TType extends string = string, TPayload = unknown> {
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
	): RuntimeEvent<TType, TPayload> {
		const occurredAt = new Date()
		return new RuntimeEvent(type, producerId, occurredAt, payload)
	}
}

export class ParticipantJoinedEvent extends RuntimeEvent<"participant.joined", ParticipantManifest> {
	static init(manifest: ParticipantManifest): ParticipantJoinedEvent {
		return RuntimeEvent.create("participant.joined", manifest.id, manifest)
	}
}

export class ParticipantLeftEvent extends RuntimeEvent<"participant.left", ParticipantManifest> {
	static init(manifest: ParticipantManifest): ParticipantLeftEvent {
		return RuntimeEvent.create("participant.left", manifest.id, manifest)
	}
}

export class MessageSentEvent extends RuntimeEvent<"message.sent", { message: string }> {
	static init(producerId: string, message: string): MessageSentEvent {
		return RuntimeEvent.create("message.sent", producerId, { message })
	}
}

export class ModelAnswerEvent extends RuntimeEvent<"model.answer", { answer: string }> {
	static init(producerId: string, answer: string): ModelAnswerEvent {
		return ModelAnswerEvent.create("model.answer", producerId, { answer })
	}
}
