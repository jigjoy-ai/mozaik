export type EnvelopeRecord<TType extends string = string, TPayload = unknown> = {
	id: string
	networkId: string
	type: TType
	senderId: string
	createdAt: Date
	payload: TPayload
}

export class Envelope<TType extends string = string, TPayload = unknown> {
	private id: string
	private networkId: string
	private type: TType
	private senderId: string
	private createdAt: Date
	private payload: TPayload

	constructor(id: string, networkId: string, type: TType, senderId: string, createdAt: Date, payload: TPayload) {
		this.id = id
		this.networkId = networkId
		this.type = type
		this.senderId = senderId
		this.createdAt = createdAt
		this.payload = payload
	}

	getId(): string {
		return this.id
	}

	getNetworkId(): string {
		return this.networkId
	}

	getType(): TType {
		return this.type
	}

	getSenderId(): string {
		return this.senderId
	}

	getCreatedAt(): Date {
		return new Date(this.createdAt)
	}

	getPayload(): TPayload {
		return structuredClone(this.payload)
	}
}
