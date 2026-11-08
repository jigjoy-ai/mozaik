import { Accounts } from "@domain/accounts"
import { Allowance, Metering } from "@domain/metering"

/** Self-hosted: no keys, everyone is the one local account. */
export class OpenAccounts implements Accounts {
	async accountFor(): Promise<string> {
		return "local"
	}
}

/** Self-hosted: nothing is counted or limited. */
export class Unmetered implements Metering {
	async allowance(): Promise<Allowance> {
		return { allowed: true }
	}

	async record(): Promise<void> {}
}
