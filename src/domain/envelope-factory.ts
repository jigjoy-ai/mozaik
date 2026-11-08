import { MessageSent, PeerJoined, PeerLeft } from "./built-in-envelopers"
import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"

export class EnvelopeFactory {
	static create<TType extends string, TPayload>(
		networkId: string,
		senderId: string,
		type: TType,
		payload: TPayload,
	): Envelope<TType, TPayload> {
		const id = crypto.randomUUID()
		const createdAt = new Date()
		return new Envelope(id, networkId, type, senderId, createdAt, payload)
	}

	static peerJoined(networkId: string, manifest: PeerManifest): PeerJoined {
		return this.create(networkId, manifest.id, "peer.joined", manifest)
	}

	static peerLeft(networkId: string, peerId: string): PeerLeft {
		return this.create(networkId, peerId, "peer.left", { peerId })
	}

	static messageSent(networkId: string, senderId: string, message: string): MessageSent {
		return this.create(networkId, senderId, "message.sent", { message })
	}
}
