import { Memory } from "@agent/domain/memory"
import { Tool } from "@inference/tool"

export type AgentRecord = {
	id: string
	name: string
	instruction: string
	tools: Tool[]
	memory: Memory
}
