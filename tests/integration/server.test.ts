import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@rstest/core"
import { AddressInfo } from "node:net"
import { Server } from "node:http"
import { WebSocket } from "ws"
import { createApp } from "src/app"
import { initNetworkModule } from "src/network-module"
import { Accounts } from "@domain/accounts"
import { Allowance, Metering } from "@domain/metering"

const keys: Record<string, string> = { pk_a: "account-a", pk_b: "account-b" }

class FakeAccounts implements Accounts {
	async accountFor(apiKey: string | undefined) {
		return apiKey ? keys[apiKey] : undefined
	}
}

class FakeMetering implements Metering {
	readonly sent = new Map<string, number>()
	limit = Infinity

	async allowance(accountId: string): Promise<Allowance> {
		return (this.sent.get(accountId) ?? 0) < this.limit
			? { allowed: true }
			: { allowed: false, reason: "Your free messages are used up: add balance in Mozaik Cloud" }
	}

	async record(accountId: string, messages: number) {
		this.sent.set(accountId, (this.sent.get(accountId) ?? 0) + messages)
	}
}

const metering = new FakeMetering()
let server: Server
let base: string
const sockets: WebSocket[] = []

beforeAll(async () => {
	initNetworkModule({ accounts: new FakeAccounts(), metering })
	server = createApp()
	await new Promise<void>((resolve) => server.listen(0, resolve))
	base = `127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
	for (const socket of sockets) socket.terminate()
	await new Promise((resolve) => server.close(resolve))
})

beforeEach(() => {
	metering.sent.clear()
	metering.limit = Infinity
})

async function post(path: string, body: unknown, key?: string) {
	const res = await fetch(`http://${base}${path}`, {
		method: "POST",
		headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) },
		body: typeof body === "string" ? body : JSON.stringify(body),
	})
	return { status: res.status, body: (await res.json()) as Record<string, any> }
}

async function network(key: string): Promise<string> {
	return (await post("/networks", { name: "team" }, key)).body.id
}

async function peer(key: string, name: string): Promise<{ id: string; token: string }> {
	return (await post("/peers", { name, role: "agent" }, key)).body as { id: string; token: string }
}

type Client = { socket: WebSocket; next(type: string): Promise<Record<string, any>>; received: Record<string, any>[] }

async function client(): Promise<Client> {
	const socket = new WebSocket(`ws://${base}`)
	sockets.push(socket)
	const received: Record<string, any>[] = []
	const waiting: { type: string; resolve: (message: Record<string, any>) => void }[] = []

	socket.on("message", (data) => {
		const message = JSON.parse(data.toString())
		const at = waiting.findIndex((w) => w.type === message.type)
		if (at >= 0) waiting.splice(at, 1)[0].resolve(message)
		else received.push(message)
	})
	await new Promise((resolve) => socket.once("open", resolve))

	return {
		socket,
		received,
		next(type) {
			const at = received.findIndex((m) => m.type === type)
			if (at >= 0) return Promise.resolve(received.splice(at, 1)[0])
			return new Promise((resolve, reject) => {
				waiting.push({ type, resolve })
				setTimeout(() => reject(new Error(`no ${type} within 2s`)), 2000)
			})
		},
	}
}

async function joined(networkId: string, token: string): Promise<Client> {
	const c = await client()
	c.socket.send(JSON.stringify({ type: "peer.join", networkId, token }))
	await c.next("peer.joined")
	return c
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 100))

describe("HTTP", () => {
	test("creating networks and peers needs an API key", async () => {
		expect((await post("/networks", { name: "team" })).status).toBe(401)
		expect((await post("/peers", { name: "x", role: "agent" }, "pk_unknown")).status).toBe(401)
	})

	test("a peer's token is returned once, with its manifest", async () => {
		const { status, body } = await post("/peers", { name: "planner", role: "agent" }, "pk_a")
		expect(status).toBe(201)
		expect(body.token).toMatch(new RegExp(`^pt_${body.id}\\.`))
		expect(body.ownerId).toBeUndefined()
	})

	test("bodies are limited in size and must be JSON", async () => {
		expect((await post("/networks", { name: "x".repeat(70_000) }, "pk_a")).status).toBe(413)
		expect((await post("/networks", "{not json", "pk_a")).status).toBe(400)
	})
})

describe("WebSocket", () => {
	test("a message reaches the other peers, from the peer the connection joined as, and is counted once", async () => {
		const networkId = await network("pk_a")
		const [one, two, three] = await Promise.all([peer("pk_a", "one"), peer("pk_a", "two"), peer("pk_a", "three")])
		const a = await joined(networkId, one.token)
		const b = await joined(networkId, two.token)
		const c = await joined(networkId, three.token)

		// It says it is peer two, in another network: neither is believed.
		a.socket.send(JSON.stringify({ type: "message.send", networkId: "elsewhere", senderId: two.id, payload: "hi" }))

		for (const receiver of [b, c]) {
			const message = await receiver.next("message.sent")
			expect(message.senderId).toBe(one.id)
			expect(message.payload).toEqual({ message: "hi" })
		}
		expect(metering.sent.get("account-a")).toBe(1)
	})

	test("an unknown token is refused, and the connection stays open", async () => {
		const networkId = await network("pk_a")
		const { id } = await peer("pk_a", "one")
		const c = await client()

		c.socket.send(JSON.stringify({ type: "peer.join", networkId, token: `pt_${id}.wrong` }))
		expect(await c.next("error")).toMatchObject({ code: "unauthorized" })

		c.socket.send(JSON.stringify({ type: "message.send", payload: "hi" }))
		expect(await c.next("error")).toMatchObject({ code: "forbidden" })
		expect(c.socket.readyState).toBe(WebSocket.OPEN)
	})

	test("another account's network can't be joined, and looks like none", async () => {
		const networkId = await network("pk_a")
		const stranger = await peer("pk_b", "stranger")
		const c = await client()

		c.socket.send(JSON.stringify({ type: "peer.join", networkId, token: stranger.token }))
		expect(await c.next("error")).toMatchObject({ code: "not_found", message: "Network not found" })
	})

	test("out of credit, a message is refused and not delivered; the connection stays open", async () => {
		const networkId = await network("pk_a")
		const [one, two] = await Promise.all([peer("pk_a", "one"), peer("pk_a", "two")])
		const a = await joined(networkId, one.token)
		const b = await joined(networkId, two.token)
		metering.limit = 0

		a.socket.send(JSON.stringify({ type: "message.send", payload: "hi" }))
		expect(await a.next("error")).toMatchObject({ code: "payment_required" })
		await settle()
		expect(b.received.filter((m) => m.type === "message.sent")).toEqual([])
		expect(metering.sent.get("account-a")).toBeUndefined()

		// Topped up, the same connection goes on.
		metering.limit = Infinity
		a.socket.send(JSON.stringify({ type: "message.send", payload: "again" }))
		expect((await b.next("message.sent")).payload).toEqual({ message: "again" })
	})

	test("malformed frames are answered, not fatal", async () => {
		const c = await client()
		c.socket.send("{not json")
		expect(await c.next("error")).toMatchObject({ code: "invalid_request" })
		c.socket.send(JSON.stringify({ type: "nope" }))
		expect(await c.next("error")).toMatchObject({ code: "invalid_request" })
		expect(c.socket.readyState).toBe(WebSocket.OPEN)
	})
})
