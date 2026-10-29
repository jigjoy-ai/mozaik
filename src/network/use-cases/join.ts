import { Peer } from "@peer/peer"
import { Connection } from "../connection"
import { ConnectionRegistry } from "../connection-registry"

export class JoinNetworkUseCase {
	constructor(private readonly connectionRegistry: ConnectionRegistry) {}

	async execute(peer: Peer, networkId: string): Promise<void> {
		console.log("Joining network", networkId)
		const connection = new Connection(peer, "ws://localhost:3000")
		console.log("Connection created", connection)
		await connection.join(networkId)
		console.log("Joined network", networkId)
		this.connectionRegistry.register(peer.id, connection)
		console.log("Connection registered", peer.id)
	}
}
