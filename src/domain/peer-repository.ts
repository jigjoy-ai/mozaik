import { Peer } from "./peer"

export interface PeerRepository {
	save(peer: Peer): Promise<void>
	findById(id: string): Promise<Peer | undefined>
}
