import { Envelope } from "./envelope"

export interface EnvelopeDelivery {
	deliver(envelope: Envelope, recipientIds: readonly string[]): Promise<void>
}
