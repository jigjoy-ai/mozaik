import { accountFor, connect, createNetwork, createPeer, disconnect, identify, resolveNetworkModule, send } from "src/network-module"
import { RequestError } from "@application/errors"
import { PeerRole } from "@domain/peer-role"
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http"
import { WebSocket, WebSocketServer } from "ws"

type ConnectionContext = {
	networkId: string
	peerId: string
}

/** How often each socket is pinged; one that hasn't answered since the last ping is closed. Load balancers drop idle connections (AWS's after 60 seconds). */
const PING_INTERVAL_MS = 30_000

/** The largest HTTP body and WebSocket frame taken; everything lives in one task's memory. */
const MAX_BODY_BYTES = 64 * 1024
const MAX_FRAME_BYTES = 256 * 1024

const httpStatus: Record<RequestError["code"], number> = {
	unauthorized: 401,
	forbidden: 403,
	not_found: 404,
	payment_required: 402,
}

const peerRoles = new Set<PeerRole>(["user", "agent", "external"])

class BodyTooLarge extends Error {}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
	res.writeHead(status, { "Content-Type": "application/json" })
	res.end(JSON.stringify(body))
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
	const chunks: Buffer[] = []
	let size = 0

	for await (const chunk of req) {
		const buffer = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer)
		size += buffer.length
		if (size > MAX_BODY_BYTES) throw new BodyTooLarge()
		chunks.push(buffer)
	}

	const text = Buffer.concat(chunks).toString("utf8").trim()
	if (!text) return {}

	return JSON.parse(text)
}

function bearer(req: IncomingMessage): string | undefined {
	const header = req.headers.authorization ?? ""
	return header.startsWith("Bearer ") ? header.slice(7).trim() || undefined : undefined
}

async function handleHttpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
	// For the load balancer's health checks.
	if (req.method === "GET" && req.url === "/healthz") {
		sendJson(res, 200, { ok: true })
		return
	}

	if (req.method !== "POST") {
		sendJson(res, 405, { error: "Method not allowed" })
		return
	}

	if (req.url !== "/networks" && req.url !== "/peers") {
		sendJson(res, 404, { error: "Not found" })
		return
	}

	const accountId = await accountFor(bearer(req))
	if (!accountId) {
		sendJson(res, 401, { error: "A Mozaik Cloud API key is required (Authorization: Bearer <key>)" })
		return
	}

	let body: unknown
	try {
		body = await readJsonBody(req)
	} catch (error) {
		if (error instanceof BodyTooLarge) sendJson(res, 413, { error: "Body too large" })
		else sendJson(res, 400, { error: "Body is not JSON" })
		return
	}

	if (req.url === "/networks") {
		const { name } = body as { name?: unknown }
		if (typeof name !== "string" || !name.trim()) {
			sendJson(res, 400, { error: "name is required" })
			return
		}

		const network = await createNetwork(name.trim(), accountId)
		sendJson(res, 201, network.toRecord())
		return
	}

	const { name, role, capabilities } = body as { name?: unknown; role?: unknown; capabilities?: unknown }

	if (typeof name !== "string" || !name.trim()) {
		sendJson(res, 400, { error: "name is required" })
		return
	}

	if (typeof role !== "string" || !peerRoles.has(role as PeerRole)) {
		sendJson(res, 400, { error: "role must be user, agent, or external" })
		return
	}

	const capabilityList = Array.isArray(capabilities)
		? capabilities.filter((item): item is string => typeof item === "string")
		: []

	const { peer, token } = await createPeer(name.trim(), role as PeerRole, capabilityList, accountId)
	// The token is shown only now: the peer joins networks with it.
	sendJson(res, 201, { ...peer.getManifest(), token })
}

/** An HTTP server with the WebSocket server on it; not yet listening. */
export function createApp(): Server {
	const httpServer = createServer((req, res) => {
		handleHttpRequest(req, res).catch((error) => {
			if (error instanceof RequestError) {
				sendJson(res, httpStatus[error.code], { error: error.message, code: error.code })
				return
			}
			console.error(error)
			sendJson(res, 500, { error: "Internal server error" })
		})
	})

	const wss = new WebSocketServer({ server: httpServer, maxPayload: MAX_FRAME_BYTES })

	const alive = new WeakSet<WebSocket>()

	const heartbeat = setInterval(() => {
		for (const socket of wss.clients) {
			if (!alive.has(socket)) {
				socket.terminate()
				continue
			}

			alive.delete(socket)
			socket.ping()
		}
	}, PING_INTERVAL_MS)

	httpServer.on("close", () => {
		clearInterval(heartbeat)
		for (const socket of wss.clients) socket.terminate()
		wss.close()
	})

	wss.on("connection", (socket) => {
		const { envelopeDelivery } = resolveNetworkModule()

		alive.add(socket)
		socket.on("pong", () => alive.add(socket))

		let context: ConnectionContext | undefined
		let pending = Promise.resolve()

		/** Errors are answered on the socket, which stays open: a client out of credit can top up and go on. */
		function reportError(error: unknown): void {
			const code = error instanceof RequestError ? error.code : "invalid_request"
			const message = error instanceof Error ? error.message : "Could not process message"
			if (!(error instanceof RequestError)) console.error(error)
			if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "error", code, message }))
		}

		async function leave(): Promise<void> {
			if (!context) return

			const { networkId, peerId } = context
			context = undefined

			envelopeDelivery.detach(networkId, socket)
			await disconnect(networkId, peerId)
		}

		async function handle(data: string): Promise<void> {
			const message = JSON.parse(data) as Record<string, unknown>

			switch (message.type) {
				case "peer.join": {
					if (context) throw new RequestError("forbidden", "This connection has already joined a network")
					if (typeof message.networkId !== "string") throw new Error("networkId is required")

					// Who the peer is comes from its token, never from the message.
					const peer = await identify(message.token)
					const networkId = message.networkId

					envelopeDelivery.attach(networkId, socket, peer.getId())

					try {
						await connect(networkId, peer)
						context = { networkId, peerId: peer.getId() }
					} catch (error) {
						envelopeDelivery.detach(networkId, socket)
						throw error
					}

					break
				}

				case "message.send": {
					if (!context) throw new RequestError("forbidden", "Join a network first (peer.join)")
					if (typeof message.payload !== "string") throw new Error("payload must be a string")

					// The network and sender are the ones this connection joined as, whatever the message says.
					await send(context.networkId, context.peerId, message.payload)

					break
				}

				case "peer.leave":
					await leave()
					socket.close(1000, "Left network")
					break

				default:
					throw new Error("Unknown message type")
			}
		}

		socket.on("message", (data) => {
			pending = pending.then(() => handle(data.toString())).catch(reportError)
		})

		socket.once("close", () => {
			pending = pending.then(leave).catch(console.error)
		})

		socket.on("error", (error) => {
			console.error(error)
		})
	})

	return httpServer
}
