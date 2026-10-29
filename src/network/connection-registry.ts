import { Connection } from "./connection"

export class ConnectionRegistry {
	private connections: Map<string, Connection> = new Map()

	register(peerId: string, connection: Connection) {
		this.connections.set(peerId, connection)
	}

	remove(peerId: string) {
		this.connections.delete(peerId)
	}

	get(peerId: string): Connection | undefined {
		return this.connections.get(peerId)
	}
}
