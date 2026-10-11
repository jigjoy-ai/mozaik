import { DirectiveContract } from "./directive-contract"
import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private manifest: PeerManifest

	constructor(id: string, manifest: PeerManifest) {
		this.id = id
		this.manifest = manifest
	}

	receive(envelope: Envelope): void {
		console.log(envelope)
	}
}
