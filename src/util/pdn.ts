import { Envelope } from "src/peer/envelope"
import { Peer } from "src/peer/peer"

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
}

function resolveOrigins(origin: string): { httpOrigin: string; wsUrl: string } {
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

class WebSocketTransport {
	private socket: WebSocket | null = null
	private connectedPromise: Promise<void> | null = null

	constructor(
		private readonly wsUrl: string,
		private readonly label: string,
	) {}

	whenConnected(): Promise<void> {
		const socket = this.ensureSocket()

		if (socket.readyState === WebSocket.OPEN) {
			return Promise.resolve()
		}

		if (this.connectedPromise) {
			return this.connectedPromise
		}

		this.connectedPromise = new Promise((resolve, reject) => {
			const onOpen = () => {
				cleanup()
				resolve()
			}

			const onFailure = () => {
				if (socket.readyState === WebSocket.OPEN) {
					return
				}
				cleanup()
				reject(new Error("WebSocket connection failed"))
			}

			const cleanup = () => {
				socket.removeEventListener("open", onOpen)
				socket.removeEventListener("error", onFailure)
				socket.removeEventListener("close", onFailure)
			}

			socket.addEventListener("open", onOpen)
			socket.addEventListener("error", onFailure)
			socket.addEventListener("close", onFailure)
		})

		return this.connectedPromise
	}

	onMessage(handler: (envelope: Envelope) => void): void {
		this.ensureSocket().addEventListener("message", (event) => {
			handler(JSON.parse(event.data) as Envelope)
		})
	}

	send(envelope: Envelope): void {
		const socket = this.ensureSocket()

		if (socket.readyState !== WebSocket.OPEN) {
			throw new Error("Socket is not connected")
		}

		socket.send(JSON.stringify(envelope))
	}

	private ensureSocket(): WebSocket {
		if (this.socket) {
			return this.socket
		}

		this.socket = new WebSocket(this.wsUrl)

		this.socket.addEventListener("open", () => {
			console.log(`Connected (${this.label})`)
		})

		this.socket.addEventListener("close", () => {
			console.log(`Disconnected (${this.label})`)
		})

		this.socket.addEventListener("error", (event) => {
			console.error(`WebSocket error (${this.label})`, event)
		})

		return this.socket
	}
}

export class Connection {
	private readonly transport: WebSocketTransport
	private joined = false

	constructor(
		private readonly peer: Peer,
		wsUrl: string,
	) {
		this.transport = new WebSocketTransport(wsUrl, peer.id)
	}

	async join(networkId: string): Promise<void> {
		if (!this.joined) {
			this.transport.onMessage((envelope) => {
				this.peer.receive(envelope)
			})
			this.joined = true
		}

		await this.transport.whenConnected()
		this.transport.send(
			this.envelope(networkId, "peer.join", {
				peerId: this.peer.id,
			}),
		)
	}

	leave(networkId: string): void {
		this.transport.send(
			this.envelope(networkId, "peer.leave", {
				peerId: this.peer.id,
			}),
		)
	}

	sendMessage(networkId: string, message: string): void {
		this.transport.send(this.envelope(networkId, "message.send", message))
	}

	private envelope(networkId: string, type: string, payload: unknown): Envelope {
		return {
			type,
			payload,
			id: crypto.randomUUID(),
			networkId,
			senderId: this.peer.id,
			createdAt: new Date(),
		}
	}
}

export class PeerDirectiveNetwork {
	private readonly httpOrigin: string
	private readonly wsUrl: string

	constructor(origin = "http://localhost:3000") {
		const resolved = resolveOrigins(origin)
		this.httpOrigin = resolved.httpOrigin
		this.wsUrl = resolved.wsUrl
	}

	async createNetwork(input: CreateNetworkInput): Promise<Network> {
		return this.post<Network>("/networks", input)
	}

	async createPeer(input: CreatePeerInput): Promise<Peer> {
		const response = await this.post<{ id: string }>("/peers", input)
		return new Peer(response.id, {
			id: response.id,
			name: input.name,
			directives: [],
		})
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
