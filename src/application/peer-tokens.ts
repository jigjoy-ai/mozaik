import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

/**
 * A peer token is `pt_<peer id>.<secret>`. Only the secret's hash is kept, so the token
 * is shown once, when the peer is created, and is what the peer joins a network with.
 */
export function issuePeerToken(peerId: string): { token: string; hash: string } {
	const secret = randomBytes(32).toString("base64url")
	return { token: `pt_${peerId}.${secret}`, hash: hashSecret(secret) }
}

export function readPeerToken(token: unknown): { peerId: string; secret: string } | undefined {
	if (typeof token !== "string" || !token.startsWith("pt_")) return undefined
	const dot = token.indexOf(".")
	if (dot < 0) return undefined
	const peerId = token.slice(3, dot)
	const secret = token.slice(dot + 1)
	return peerId && secret ? { peerId, secret } : undefined
}

export function secretMatches(secret: string, hash: string): boolean {
	const given = Buffer.from(hashSecret(secret), "hex")
	const kept = Buffer.from(hash, "hex")
	return given.length === kept.length && timingSafeEqual(given, kept)
}

function hashSecret(secret: string): string {
	return createHash("sha256").update(secret).digest("hex")
}
