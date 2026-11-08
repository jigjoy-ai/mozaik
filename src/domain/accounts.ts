/** Says which account an API key belongs to. Networks and peers belong to the account that created them. */
export interface Accounts {
	accountFor(apiKey: string | undefined): Promise<string | undefined>
}
