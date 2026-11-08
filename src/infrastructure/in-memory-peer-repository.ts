import { Peer } from "@domain/peer"
import { PeerRepository } from "@domain/peer-repository"

export class InMemoryPeerRepository implements PeerRepository {
	private readonly peers = new Map<string, Peer>()

	async save(peer: Peer): Promise<void> {
		this.peers.set(peer.getId(), peer)
	}

	async findById(id: string): Promise<Peer | undefined> {
		return this.peers.get(id)
	}
}
