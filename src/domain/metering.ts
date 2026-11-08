export type Allowance = { allowed: true } | { allowed: false; reason: string }

/** Counts the messages each account's networks carry, and says whether an account may send more. */
export interface Metering {
	allowance(accountId: string): Promise<Allowance>
	record(accountId: string, messages: number): Promise<void>
}
