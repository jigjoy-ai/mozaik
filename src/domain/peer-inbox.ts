import { Envelope } from "@domain/envelope"

export class PeerInbox {
	private envelopes: Envelope[] = []

	receive(envelope: Envelope): void {
		this.envelopes.push(envelope)
	}

	take(): Envelope | undefined {
		return this.envelopes.shift()
	}

	peek(): Envelope | undefined {
		return this.envelopes[0]
	}

	get size(): number {
		return this.envelopes.length
	}
}
