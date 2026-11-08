import { NetworkRepository } from "@domain/network-repository"
import { PeerLeft } from "@domain/built-in-envelopers"
import { EnvelopeDistribution } from "@application/services/envelope-distribution"

export class DisconnectPeerUseCase {
	constructor(
		private readonly networks: NetworkRepository,
		private readonly distribution: EnvelopeDistribution,
	) {}

	async execute(networkId: string, peerId: string): Promise<PeerLeft> {
		const network = await this.networks.findById(networkId)
		if (!network) throw new Error("Network not found")

		const envelope = network.disconnect(peerId)

		await this.networks.save(network)
		await this.distribution.toAllPeers(network, envelope)

		return envelope
	}
}
