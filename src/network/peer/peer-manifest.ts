import { Tool } from "@agent/domain/inference/tool"

export interface PeerManifest {
	id: string
	name: string
	capabilities: string[]
}
