import { Peer } from "src/peer/peer"
import { Connection } from "./connection"
import { Policy } from "@peer/policy"

export type Network = {
	id: string
}

export type CreateNetworkPayload = {
	name: string
}

export type CreatePeerPayload = {
	name: string
	capabilities: string[]
	networkId: string
	role: "agent" | "user"
	policy: Policy
}

const origin = process.env.PDN_ORIGIN || "http://localhost:3000"

export class MozaikNetworkClient {
	private readonly httpOrigin: string
	private readonly wsUrl: string

	constructor() {
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

	async createNetwork(payload: CreateNetworkPayload): Promise<Network> {
		return this.post<Network>("/networks", payload)
	}

	async createPeer(payload: CreatePeerPayload): Promise<Peer> {
		const response = await this.post<{ id: string }>("/peers", payload)
		return new Peer(response.id, payload.policy)
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
