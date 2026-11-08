import { EnvelopeDistribution } from "@application/services/envelope-distribution"
import { RequestError } from "@application/errors"
import { EnvelopeFactory } from "@domain/envelope-factory"
import { Metering } from "@domain/metering"
import { NetworkRepository } from "@domain/network-repository"

export class SendEnvelopeUseCase {
	constructor(
		private readonly networks: NetworkRepository,
		private readonly distribution: EnvelopeDistribution,
		private readonly metering: Metering,
	) {}

	/** One message sent is one message counted, against the network's owner, however many peers it reaches. */
	async execute(networkId: string, senderId: string, message: string): Promise<void> {
		const network = await this.networks.findById(networkId)
		if (!network) throw new RequestError("not_found", "Network not found")

		const envelope = EnvelopeFactory.messageSent(networkId, senderId, message)
		network.validateEnvelope(envelope)

		const ownerId = network.getOwnerId()
		const allowance = await this.metering.allowance(ownerId)
		if (!allowance.allowed) throw new RequestError("payment_required", allowance.reason)

		await this.metering.record(ownerId, 1)
		await this.distribution.toOtherPeers(network, envelope, senderId)
	}
}
