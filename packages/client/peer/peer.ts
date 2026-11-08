import { Envelope } from "./envelope"
import { BehaviorPolicy } from "./behavior-policy"
import { PeerManifest } from "./peer-manifest"
import { reactToMessage } from "../index"

export type PeerRole = "agent" | "application" | "device"

export class Peer {
	readonly id: string
	private policy: BehaviorPolicy
	private manifest: PeerManifest

	constructor(id: string, manifest: PeerManifest, policy: BehaviorPolicy) {
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
