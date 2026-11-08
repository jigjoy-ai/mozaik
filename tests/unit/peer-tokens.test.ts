import { describe, expect, test } from "@rstest/core"
import { issuePeerToken, readPeerToken, secretMatches } from "@application/peer-tokens"

describe("peer tokens", () => {
	test("a token names its peer, and only its own secret matches the kept hash", () => {
		const { token, hash } = issuePeerToken("peer-1")
		const parsed = readPeerToken(token)

		expect(parsed?.peerId).toBe("peer-1")
		expect(secretMatches(parsed!.secret, hash)).toBe(true)
		expect(secretMatches("something-else", hash)).toBe(false)
		expect(hash).not.toContain(parsed!.secret)
	})

	test("anything not shaped like a token is not one", () => {
		for (const value of [undefined, 42, "", "peer-1.secret", "pt_", "pt_peer-1", "pt_.secret", "pt_peer-1."]) {
			expect(readPeerToken(value)).toBeUndefined()
		}
	})
})
