import { PendingOperation } from "@agent/domain/loop/operation"
import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"
import { Connection } from "@util/connection"
import { Policy } from "./policy"
import { RuleEngine } from "./rule-engine"
import { DirectiveProcessor } from "./directive-processor"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private policy: Policy
	private connections: Map<string, Connection> = new Map()

	constructor(
		id: string,
		//manifest: PeerManifest,
		policy: Policy,
		//ruleEngine: RuleEngine,
	) {
		this.id = id
		this.policy = policy
	}

	async receive(envelope: Envelope<any>): Promise<void> {
		console.log("Received envelope:", envelope)
		// const operationId = await this.ruleEngine.decide(this.rulebook, envelope)
		// console.log("Peer: operationId", operationId)
		// if (!operationId) {
		// 	return
		// }

		// const directiveResult = await this.directiveProcessor.process(envelope.payload, operationId)

		// await this.sendMessage(envelope.networkId, JSON.stringify(directiveResult))
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
