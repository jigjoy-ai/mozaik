import { Envelope } from "@peer/envelope"

export class WebSocketTransport {
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

	onMessage(handler: (envelope: Envelope<unknown>) => void): void {
		this.ensureSocket().addEventListener("message", (event) => {
			handler(JSON.parse(event.data) as Envelope<unknown>)
		})
	}

	send(envelope: Envelope<unknown>): void {
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
