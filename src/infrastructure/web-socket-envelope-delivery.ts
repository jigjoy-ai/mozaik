import { WebSocket } from "ws"
import { Envelope } from "@domain/envelope"
import { EnvelopeDelivery } from "@domain/envelope-delivery"

export class WebSocketEnvelopeDelivery implements EnvelopeDelivery {
	private readonly connections = new Map<string, Set<WebSocket>>()
	private readonly peerBySocket = new WeakMap<WebSocket, string>()

	attach(networkId: string, socket: WebSocket, peerId: string): void {
		let sockets = this.connections.get(networkId)

		if (!sockets) {
			sockets = new Set()
			this.connections.set(networkId, sockets)
		}

		if (sockets.has(socket)) return

		sockets.add(socket)
		this.peerBySocket.set(socket, peerId)

		socket.once("close", () => {
			this.peerBySocket.delete(socket)
			sockets.delete(socket)

			if (sockets.size === 0) {
				this.connections.delete(networkId)
			}
		})
	}

	detach(networkId: string, socket: WebSocket): void {
		const sockets = this.connections.get(networkId)
		if (!sockets) return

		sockets.delete(socket)
		this.peerBySocket.delete(socket)

		if (sockets.size === 0) {
			this.connections.delete(networkId)
		}
	}

	async deliver(envelope: Envelope, recipientIds: readonly string[]): Promise<void> {
		const networkId = envelope.getNetworkId()
		const sockets = this.connections.get(networkId)
		if (!sockets || recipientIds.length === 0) return

		const recipients = new Set(recipientIds)
		const message = JSON.stringify(envelope)

		await Promise.all(
			[...sockets]
				.filter((socket) => {
					const peerId = this.peerBySocket.get(socket)
					return peerId !== undefined && recipients.has(peerId)
				})
				.map((socket) => this.send(socket, message)),
		)
	}

	private send(socket: WebSocket, message: string): Promise<void> {
		if (socket.readyState !== WebSocket.OPEN) {
			return Promise.resolve()
		}

		return new Promise<void>((resolve, reject) => {
			socket.send(message, (error) => {
				if (error) reject(error)
				else resolve()
			})
		})
	}
}
