import { Envelope } from "./envelope"
import { PeerManifest } from "./peer-manifest"

export type PeerJoined = Envelope<"peer.joined", PeerManifest>

export type PeerLeft = Envelope<"peer.left", { peerId: string }>

export type MessageSent = Envelope<"message.sent", { message: string }>
