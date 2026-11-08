import { Envelope } from "@domain/envelope"
import { EnvelopeRepository } from "@domain/envelope-repositories"

export class InMemoryEnvelopeRepository implements EnvelopeRepository {
	private envelopes: Envelope[] = []

	save(envelope: Envelope): Promise<void> {
		this.envelopes.push(envelope)
		return Promise.resolve()
	}

	findById(id: string): Promise<Envelope | undefined> {
		return Promise.resolve(this.envelopes.find((envelope) => envelope.getId() === id))
	}

	findByNetworkId(networkId: string, options: { offset: number; limit: number }): Promise<Envelope[]> {
		return Promise.resolve(this.envelopes.filter((envelope) => envelope.getNetworkId() === networkId))
	}
}
