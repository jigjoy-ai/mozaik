import { PeerJoined } from "@domain/built-in-envelopers"
import { NetworkRepository } from "@domain/network-repository"
import { Peer } from "@domain/peer"
import { PeerRepository } from "@domain/peer-repository"
import { EnvelopeDistribution } from "@application/services/envelope-distribution"
import { RequestError } from "@application/errors"
import { readPeerToken, secretMatches } from "@application/peer-tokens"

export class ConnectPeerUseCase {
	constructor(
		private readonly networks: NetworkRepository,
		private readonly peers: PeerRepository,
		private readonly distribution: EnvelopeDistribution,
	) {}

	/** The peer whose token this is, or an error: who a connection is comes only from its token. */
	async identify(token: unknown): Promise<Peer> {
		const parsed = readPeerToken(token)
		const peer = parsed && (await this.peers.findById(parsed.peerId))
		if (!parsed || !peer || !secretMatches(parsed.secret, peer.getTokenHash())) {
			throw new RequestError("unauthorized", "Unknown peer token")
		}
		return peer
	}

	async execute(networkId: string, peer: Peer): Promise<PeerJoined> {
		const network = await this.networks.findById(networkId)
		// The same answer for someone else's network as for none, so ids can't be probed.
		if (!network || network.getOwnerId() !== peer.getOwnerId()) {
			throw new RequestError("not_found", "Network not found")
		}

		const envelope = network.connect(peer.getManifest())

		await this.networks.save(network)
		await this.distribution.toAllPeers(network, envelope)

		return envelope
	}
}
