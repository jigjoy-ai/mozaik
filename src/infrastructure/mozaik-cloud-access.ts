import { createHash } from "node:crypto"
import { Accounts } from "@domain/accounts"
import { Allowance, Metering } from "@domain/metering"

// The hosted network (network.app.jigjoy.ai) bills through Mozaik Cloud: a developer's
// Mozaik Cloud project key says whose networks they make, and every message is counted
// against that account, which has 500 free ones and then pays from a balance it tops up.
// See mozaik-cloud's apps/ingest/src/network/routes.ts for the other side.

type Fetch = typeof fetch

/** Asks Mozaik Cloud whose a project key is, and remembers the answer for a while. */
export class MozaikCloudAccounts implements Accounts {
	private readonly known = new Map<string, { accountId: string | undefined; until: number }>()

	constructor(
		private readonly baseUrl: string,
		private readonly options: { fetch?: Fetch; now?: () => number } = {},
	) {}

	async accountFor(apiKey: string | undefined): Promise<string | undefined> {
		if (!apiKey) return undefined
		const now = this.options.now?.() ?? Date.now()
		// Kept by hash, never the key itself.
		const hash = createHash("sha256").update(apiKey).digest("hex")
		const hit = this.known.get(hash)
		if (hit && hit.until > now) return hit.accountId

		const res = await (this.options.fetch ?? fetch)(`${this.baseUrl}/v1/network/account`, {
			headers: { authorization: `Bearer ${apiKey}` },
		})
		if (res.status === 401 || res.status === 403) {
			this.remember(hash, undefined, now + 30_000)
			return undefined
		}
		if (!res.ok) throw new Error(`Mozaik Cloud answered ${res.status} for a key`)
		const { accountId } = (await res.json()) as { accountId: string }
		this.remember(hash, accountId, now + 5 * 60_000)
		return accountId
	}

	private remember(hash: string, accountId: string | undefined, until: number): void {
		if (this.known.size > 10_000) this.known.clear()
		this.known.set(hash, { accountId, until })
	}
}

type Known = { left: number; reason?: string; at: number }

/** How soon an account that has used up its messages is asked about again. */
const USED_UP_RECHECK_MS = 5_000

/**
 * Counts messages here and reports them to Mozaik Cloud every few seconds; each answer says how
 * many more each account may send, which is counted down here between answers. An account is
 * asked about again when its answer is old or used up (it may have topped up since).
 *
 * If Mozaik Cloud can't be reached, messages go through and are reported once it can: an outage
 * there shouldn't stop agents talking here.
 */
export class MozaikCloudMetering implements Metering {
	private pending = new Map<string, number>()
	private readonly known = new Map<string, Known>()
	/** One question per account at a time, however many messages wait on it. */
	private readonly asking = new Map<string, Promise<void>>()
	private timer: NodeJS.Timeout | undefined
	private readonly flushMs: number
	private readonly staleMs: number

	constructor(
		private readonly baseUrl: string,
		private readonly serviceToken: string,
		private readonly options: { fetch?: Fetch; now?: () => number; flushMs?: number; staleMs?: number } = {},
	) {
		this.flushMs = options.flushMs ?? 5_000
		this.staleMs = options.staleMs ?? 30_000
	}

	async allowance(accountId: string): Promise<Allowance> {
		let known = this.known.get(accountId)
		const age = known ? this.now() - known.at : Infinity
		// Used up, it's asked again (a top-up may have come), but not for every message an agent retries.
		if (age > this.staleMs || (known!.left <= 0 && age > USED_UP_RECHECK_MS)) {
			let asking = this.asking.get(accountId)
			if (!asking) {
				asking = this.sync([accountId])
					.catch((error) => console.error("Mozaik Cloud usage sync failed", error))
					.finally(() => this.asking.delete(accountId))
				this.asking.set(accountId, asking)
			}
			await asking
			known = this.known.get(accountId)
		}
		if (!known || known.left > 0) return { allowed: true }
		return { allowed: false, reason: known.reason ?? "No Mozaik Network messages left" }
	}

	async record(accountId: string, messages: number): Promise<void> {
		this.pending.set(accountId, (this.pending.get(accountId) ?? 0) + messages)
		const known = this.known.get(accountId)
		if (known) known.left -= messages
		this.timer ??= setTimeout(() => {
			this.timer = undefined
			this.sync().catch((error) => console.error("Mozaik Cloud usage report failed", error))
		}, this.flushMs)
		this.timer.unref?.()
	}

	/** Reports whatever is still counted here; for shutting down. */
	async flush(): Promise<void> {
		if (this.timer) clearTimeout(this.timer)
		this.timer = undefined
		await this.sync()
	}

	/** Reports what was sent (and asks about `alsoAsk`); what's sent meanwhile stays counted for the next report. */
	private async sync(alsoAsk: string[] = []): Promise<void> {
		const reported = this.pending
		this.pending = new Map()
		const usage: Record<string, number> = Object.fromEntries(reported)
		for (const accountId of alsoAsk) usage[accountId] ??= 0
		if (Object.keys(usage).length === 0) return

		let answer: { accounts: Record<string, { messagesLeft: number; reason?: string }> }
		try {
			const res = await (this.options.fetch ?? fetch)(`${this.baseUrl}/v1/network/usage`, {
				method: "POST",
				headers: { authorization: `Bearer ${this.serviceToken}`, "content-type": "application/json" },
				body: JSON.stringify({ usage }),
			})
			if (!res.ok) throw new Error(`Mozaik Cloud answered ${res.status}`)
			answer = (await res.json()) as typeof answer
		} catch (error) {
			// Not reported: counted again with what comes next.
			for (const [accountId, messages] of reported) this.pending.set(accountId, (this.pending.get(accountId) ?? 0) + messages)
			throw error
		}

		const at = this.now()
		for (const [accountId, { messagesLeft, reason }] of Object.entries(answer.accounts ?? {})) {
			// Sent since this report went out: not in the answer yet.
			const since = this.pending.get(accountId) ?? 0
			this.known.set(accountId, { left: messagesLeft - since, reason, at })
		}
	}

	private now(): number {
		return this.options.now?.() ?? Date.now()
	}
}
