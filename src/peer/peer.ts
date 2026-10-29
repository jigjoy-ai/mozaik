import { Envelope } from "./envelope"
import { Policy } from "./policy"
import { PeerManifest } from "./peer-manifest"
import { reactToMessage } from "src/network"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private policy: Policy
	private manifest: PeerManifest

	constructor(id: string, manifest: PeerManifest, policy: Policy) {
		this.id = id
		this.policy = policy
		this.manifest = manifest
	}

	async receive(envelope: Envelope<any>): Promise<void> {
		console.log("Received envelope:", envelope)
		reactToMessage(this, envelope.networkId, envelope)

		// await this.sendMessage(envelope.networkId, JSON.stringify(directiveResult))
	}
}
