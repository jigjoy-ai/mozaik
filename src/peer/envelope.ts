export type Envelope<TType extends string = string, TPayload = unknown> = {
	id: string
	networkId: string
	type: TType
	senderId: string
	createdAt: Date
	payload: TPayload
}
