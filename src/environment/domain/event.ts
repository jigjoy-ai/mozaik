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
		occurredAt: Date,
		payload: TPayload,
	): RuntimeEvent<TType, TPayload> {
		return new RuntimeEvent(type, producerId, occurredAt, payload)
	}
}

export class ParticipantJoinedEvent extends RuntimeEvent<"participant.joined", ParticipantManifest> {
	static init(manifest: ParticipantManifest, occurredAt: Date): ParticipantJoinedEvent {
		return RuntimeEvent.create("participant.joined", manifest.id, occurredAt, manifest)
	}
}

export class ParticipantLeftEvent extends RuntimeEvent<"participant.left", ParticipantManifest> {
	static init(manifest: ParticipantManifest, occurredAt: Date): ParticipantLeftEvent {
		return RuntimeEvent.create("participant.left", manifest.id, occurredAt, manifest)
	}
}

export class MessageSentEvent extends RuntimeEvent<"message.sent", { message: string }> {
	static init(producerId: string, message: string, occurredAt: Date): MessageSentEvent {
		return RuntimeEvent.create("message.sent", producerId, occurredAt, { message })
	}
}

export class ModelAnswerEvent extends RuntimeEvent<"model.answer", { answer: string }> {
	static init(producerId: string, answer: string, occurredAt: Date): ModelAnswerEvent {
		return ModelAnswerEvent.create("model.answer", producerId, occurredAt, { answer })
	}
}
