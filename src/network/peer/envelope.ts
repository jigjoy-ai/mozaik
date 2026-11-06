export type Envelope<TPayload> = {
	id: string
	networkId: string
	type: string
	senderId: string
	createdAt: Date
	payload: TPayload
}
