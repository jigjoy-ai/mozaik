import { Peer } from "@peer/peer"
import { ConnectionRegistry } from "../connection-registry"

export class LeaveNetworkUseCase {
	constructor(private readonly connections: ConnectionRegistry) {}

	async execute(peer: Peer, networkId: string): Promise<void> {
		const connection = this.connections.get(peer.id)
		if (!connection) {
			throw new Error(`Connection to peer ${peer.id} not found`)
		}
		connection.leave(networkId)
		this.connections.remove(peer.id)
	}
}
