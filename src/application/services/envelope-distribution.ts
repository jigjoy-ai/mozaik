import { Envelope } from "@domain/envelope"
import { EnvelopeDelivery } from "@domain/envelope-delivery"
import { Network } from "@domain/network"

export class EnvelopeDistribution {
	constructor(private readonly delivery: EnvelopeDelivery) {}

	async toAllPeers(network: Network, envelope: Envelope): Promise<void> {
		await this.delivery.deliver(envelope, network.getPeerIds())
	}

	async toOtherPeers(network: Network, envelope: Envelope, senderId: string): Promise<void> {
		const recipientIds = network.getPeerIds().filter((id) => id !== senderId)
		await this.delivery.deliver(envelope, recipientIds)
	}
}
