import { PeerRole } from "@domain/peer-role"

export type PeerManifest = {
	readonly id: string
	readonly name: string
	readonly role: PeerRole
	readonly capabilities?: readonly string[]
}
