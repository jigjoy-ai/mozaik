import { Tool } from "@inference/tool"

export interface PeerManifest {
	id: string
	name: string
	tools: Tool[]
}
