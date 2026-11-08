import { describe, expect, test } from "@rstest/core"
import { MozaikCloudAccounts, MozaikCloudMetering } from "@infrastructure/mozaik-cloud-access"

type Call = { url: string; authorization?: string; usage?: Record<string, number> }

/** A Mozaik Cloud that starts every account with `left` messages and counts down what's reported. */
function cloud(start: Record<string, number>, opts: { down?: () => boolean } = {}) {
	const left = { ...start }
	const calls: Call[] = []
	const fetch = (async (url: string, init?: RequestInit) => {
		const headers = (init?.headers ?? {}) as Record<string, string>
		const call: Call = { url, authorization: headers.authorization }
		calls.push(call)
		if (opts.down?.()) throw new Error("connect ECONNREFUSED")
		if (url.endsWith("/v1/network/account")) {
			const accountId = { "Bearer pk_alice": "user_alice" }[headers.authorization ?? ""]
			return accountId ? Response.json({ accountId }) : Response.json({ error: "unknown" }, { status: 403 })
		}
		const { usage } = JSON.parse(String(init?.body)) as { usage: Record<string, number> }
		call.usage = usage
		const accounts: Record<string, { messagesLeft: number; reason?: string }> = {}
		for (const [id, n] of Object.entries(usage)) {
			left[id] = Math.max(0, (left[id] ?? 0) - n)
			accounts[id] = left[id] > 0 ? { messagesLeft: left[id] } : { messagesLeft: 0, reason: "add balance" }
		}
		return Response.json({ accounts })
	}) as typeof globalThis.fetch
	return { fetch, calls, left }
}

function clock() {
	let t = 0
	return { now: () => t, advance: (ms: number) => (t += ms) }
}

describe("MozaikCloudAccounts", () => {
	test("a key names its account, and is asked about once a while", async () => {
		const { fetch, calls } = cloud({})
		const c = clock()
		const accounts = new MozaikCloudAccounts("https://cloud", { fetch, now: c.now })

		expect(await accounts.accountFor("pk_alice")).toBe("user_alice")
		expect(await accounts.accountFor("pk_alice")).toBe("user_alice")
		expect(calls).toHaveLength(1)
		expect(calls[0].authorization).toBe("Bearer pk_alice")

		expect(await accounts.accountFor("pk_unknown")).toBeUndefined()
		expect(await accounts.accountFor(undefined)).toBeUndefined()
		c.advance(6 * 60_000)
		await accounts.accountFor("pk_alice")
		expect(calls).toHaveLength(3)
	})
})

describe("MozaikCloudMetering", () => {
	const options = (fetch: typeof globalThis.fetch, now: () => number) => ({ fetch, now, flushMs: 60_000, staleMs: 30_000 })

	test("messages are counted down here and reported together, with the service token", async () => {
		const { fetch, calls } = cloud({ user_alice: 3 })
		const c = clock()
		const metering = new MozaikCloudMetering("https://cloud", "svc", options(fetch, c.now))

		for (let i = 0; i < 3; i++) {
			expect(await metering.allowance("user_alice")).toEqual({ allowed: true })
			await metering.record("user_alice", 1)
		}
		// The first question was the only call: the rest were counted down here.
		expect(calls).toHaveLength(1)
		expect(calls[0]).toMatchObject({ url: "https://cloud/v1/network/usage", authorization: "Bearer svc", usage: { user_alice: 0 } })

		c.advance(USED_UP + 1)
		// Used up here: asked again, and the three sent go along.
		expect(await metering.allowance("user_alice")).toEqual({ allowed: false, reason: "add balance" })
		expect(calls[1].usage).toEqual({ user_alice: 3 })
	})

	test("a used-up account isn't asked about for every message, but is again a little later (a top-up may have come)", async () => {
		const { fetch, calls, left } = cloud({ user_alice: 0 })
		const c = clock()
		const metering = new MozaikCloudMetering("https://cloud", "svc", options(fetch, c.now))

		expect((await metering.allowance("user_alice")).allowed).toBe(false)
		expect((await metering.allowance("user_alice")).allowed).toBe(false)
		expect(calls).toHaveLength(1)

		left.user_alice = 100
		c.advance(USED_UP + 1)
		expect((await metering.allowance("user_alice")).allowed).toBe(true)
		expect(calls).toHaveLength(2)
	})

	test("many messages waiting on the same account ask once", async () => {
		const { fetch, calls } = cloud({ user_alice: 10 })
		const metering = new MozaikCloudMetering("https://cloud", "svc", options(fetch, clock().now))
		await Promise.all(Array.from({ length: 20 }, () => metering.allowance("user_alice")))
		expect(calls).toHaveLength(1)
	})

	test("with Mozaik Cloud down, messages go through and are reported once it's back", async () => {
		let down = true
		const { fetch, calls } = cloud({ user_alice: 100 }, { down: () => down })
		const c = clock()
		const metering = new MozaikCloudMetering("https://cloud", "svc", options(fetch, c.now))

		expect(await metering.allowance("user_alice")).toEqual({ allowed: true })
		await metering.record("user_alice", 2)
		await expect(metering.flush()).rejects.toThrow()

		down = false
		await metering.flush()
		expect(calls[calls.length - 1]?.usage).toEqual({ user_alice: 2 })
	})

	test("what's sent while a report is on its way is counted against the answer, and reported next", async () => {
		const { fetch: base, calls } = cloud({ user_alice: 10 })
		let metering!: MozaikCloudMetering
		let once = true
		// One message more is sent while the report is out.
		const fetch = (async (url: string, init?: RequestInit) => {
			if (once && String(init?.body).includes('"user_alice":1')) {
				once = false
				await metering.record("user_alice", 1)
			}
			return base(url, init)
		}) as typeof globalThis.fetch
		const c = clock()
		metering = new MozaikCloudMetering("https://cloud", "svc", options(fetch, c.now))

		await metering.allowance("user_alice")
		await metering.record("user_alice", 1)
		await metering.flush()
		// Cloud says 9 left after the one reported; the one sent meanwhile makes it 8 here.
		for (let i = 0; i < 8; i++) {
			expect((await metering.allowance("user_alice")).allowed).toBe(true)
			await metering.record("user_alice", 1)
		}
		c.advance(USED_UP + 1)
		expect((await metering.allowance("user_alice")).allowed).toBe(false)
		expect(calls[calls.length - 1]?.usage).toEqual({ user_alice: 9 })
	})
})

const USED_UP = 5_000
