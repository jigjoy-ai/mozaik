import { DirectiveContract } from "./directive-contract"
import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"
import { Connection } from "@util/connection"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private manifest: PeerManifest
	private connections: Map<string, Connection> = new Map()

	constructor(id: string, manifest: PeerManifest) {
		this.id = id
		this.manifest = manifest
	}

	receive(envelope: Envelope): void {
		console.log(envelope)
	}

	async join(networkId: string): Promise<void> {
		const connection = new Connection(this, "ws://localhost:3000")
		await connection.join(networkId)
		this.connections.set(networkId, connection)
	}

	leave(networkId: string): void {
		const connection = this.connections.get(networkId)
		if (!connection) {
			throw new Error(`Connection to network ${networkId} not found`)
		}
		connection.leave(networkId)
		this.connections.delete(networkId)
	}

	sendMessage(networkId: string, message: string): void {
		const connection = this.connections.get(networkId)
		if (!connection) {
			throw new Error(`Connection to network ${networkId} not found`)
		}
		connection.sendMessage(networkId, message)
	}
}
