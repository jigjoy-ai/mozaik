import { Directive } from "./directive"
import { DirectiveResult } from "./directive-result"

export type Envelope<TPayload> = {
	id: string
	networkId: string
	type: string
	senderId: string
	createdAt: Date
	payload: TPayload
}

interface DirectiveEnvelope {
	senderId: string
	recipientId: string
	targetLoopId?: string
	directive: Directive
}

interface DirectiveResultEnvelope {
	senderId: string
	recipientId: string
	targetLoopId?: string
	directiveResult: DirectiveResult
}
