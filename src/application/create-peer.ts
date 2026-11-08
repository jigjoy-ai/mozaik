import { issuePeerToken } from "@application/peer-tokens"
import { Peer } from "@domain/peer"
import { PeerRepository } from "@domain/peer-repository"
import { PeerRole } from "@domain/peer-role"

export class CreatePeerUseCase {
	private readonly peerRepository: PeerRepository

	constructor(peerRepository: PeerRepository) {
		this.peerRepository = peerRepository
	}

	/** The token is returned only here: it is what the peer joins networks with. */
	async execute(
		name: string,
		role: PeerRole,
		capabilities: readonly string[],
		ownerId: string,
	): Promise<{ peer: Peer; token: string }> {
		const id = crypto.randomUUID()
		const manifest = { id, name, role, capabilities }
		const { token, hash } = issuePeerToken(id)
		const peer = Peer.create(manifest, ownerId, hash)
		await this.peerRepository.save(peer)
		return { peer, token }
	}
}
