import { Peer } from "src/peer/peer"
import { Connection } from "./connection"
import { EnvelopeRuleEngine } from "@peer/envelope-rule-engine"
import { OperationRegistry } from "@peer/operation-registry"
import { Rulebook } from "@peer/rulebook"
import { EnvelopeSpecificationRegistry } from "@peer/envelope-specification-registry"

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

export class PeerDirectiveNetwork {
	private readonly httpOrigin: string
	private readonly wsUrl: string

	constructor(origin = "http://localhost:3000") {
		const resolved = this.resolveOrigins(origin)
		this.httpOrigin = resolved.httpOrigin
		this.wsUrl = resolved.wsUrl
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
			{
				id: response.id,
				name: input.name,
				contracts: [],
			},
			input.rulebook,
			new EnvelopeRuleEngine(new EnvelopeSpecificationRegistry()),
			new OperationRegistry(),
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
