import { Envelope } from "@peer/envelope"
import { Peer } from "@peer/peer"
import { WebSocketTransport } from "@util/websocket-transport"

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
