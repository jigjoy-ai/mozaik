import { PendingOperation } from "@agent/domain/loop/operation"
import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"
import { Connection } from "@util/connection"
import { Rulebook } from "./rulebook"
import { EnvelopeRuleEngine } from "./envelope-rule-engine"
import { OperationRegistry } from "./operation-registry"
import { DirectiveResult } from "./directive-result"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private manifest: PeerManifest
	private pendingOperations: Map<string, PendingOperation> = new Map()
	private rulebook: Rulebook
	private connections: Map<string, Connection> = new Map()
	private ruleEngine: EnvelopeRuleEngine
	private operationRegistry: OperationRegistry

	constructor(
		id: string,
		manifest: PeerManifest,
		rulebook: Rulebook,
		envelopeRuleEngine: EnvelopeRuleEngine,
		operationRegistry: OperationRegistry,
	) {
		this.id = id
		this.manifest = manifest
		this.rulebook = rulebook
		this.ruleEngine = envelopeRuleEngine
		this.operationRegistry = operationRegistry
	}

	async receive(envelope: Envelope<any>): Promise<void> {
		console.log("Received envelope:", envelope)
		const operationId = await this.ruleEngine.decide(this.rulebook, envelope)
		if (!operationId) {
			throw new Error(`No operation found for envelope ${envelope.id}`)
		}

		// TODO: Execute the operation and send the result back to the sender
		const operation = this.operationRegistry.get(operationId)
		const result = await operation.invoke(envelope)
		const resultEnvelope: Envelope<DirectiveResult> = {
			id: envelope.id,
			networkId: envelope.networkId,
			type: "directive-result",
			senderId: this.id,
			createdAt: new Date(),
			payload: {
				directiveId: operationId,
				output: result,
			},
		}
		await this.sendMessage(envelope.networkId, JSON.stringify(resultEnvelope))
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
