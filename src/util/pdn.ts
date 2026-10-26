import { Peer } from "src/peer/peer"
import { Connection } from "./connection"
import { EnvelopeRuleEngine } from "@peer/envelope-rule-engine"
import { OperationRegistry } from "@peer/operation-registry"
import { Rulebook } from "@peer/rulebook"
import { EnvelopeSpecificationRegistry } from "@peer/envelope-specification-registry"
import { DirectiveProcessor } from "@peer/directive-processor"

export type Network = {
	id: string
}

export type CreateNetworkInput = {
	name: string
}

export type CreatePeerInput = {
	name: string
	capabilities: string[]
	networkId: string
	role: "agent" | "user"
	rulebook: Rulebook
}

const origin = process.env.PDN_ORIGIN || "http://localhost:3000"

export class PeerDirectiveNetwork {
	private readonly httpOrigin: string
	private readonly wsUrl: string
	private readonly operationRegistry: OperationRegistry
	private readonly specificationRegistry: EnvelopeSpecificationRegistry

	constructor(operationRegistry: OperationRegistry, specificationRegistry: EnvelopeSpecificationRegistry) {
		const resolved = this.resolveOrigins(origin)
		this.httpOrigin = resolved.httpOrigin
		this.wsUrl = resolved.wsUrl
		this.operationRegistry = operationRegistry
		this.specificationRegistry = specificationRegistry
	}

	private resolveOrigins(origin: string): { httpOrigin: string; wsUrl: string } {
		const trimmed = origin.replace(/\/$/, "")

		if (trimmed.startsWith("ws://") || trimmed.startsWith("wss://")) {
			return {
				wsUrl: trimmed,
				httpOrigin: trimmed.replace(/^ws(s)?/, "http$1"),
			}
		}

		return {
			httpOrigin: trimmed,
			wsUrl: trimmed.replace(/^http(s)?/, "ws$1"),
		}
	}

	async createNetwork(input: CreateNetworkInput): Promise<Network> {
		return this.post<Network>("/networks", input)
	}

	async createPeer(input: CreatePeerInput): Promise<Peer> {
		const response = await this.post<{ id: string }>("/peers", input)
		return new Peer(
			response.id,
			input.rulebook,
			new EnvelopeRuleEngine(this.specificationRegistry),
			new DirectiveProcessor(this.operationRegistry),
		)
	}

	connection(peer: Peer): Connection {
		return new Connection(peer, this.wsUrl)
	}

	private async post<T>(path: string, body: unknown): Promise<T> {
		const response = await fetch(`${this.httpOrigin}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			const detail = await response.text()
			throw new Error(`POST ${path} failed (${response.status}): ${detail || response.statusText}`)
		}

		return response.json() as Promise<T>
	}
}
