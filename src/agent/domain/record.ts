import { Memory } from "@agent/domain/memory"
import type { ToolDefinition } from "@agent/domain/inference/tool"

export type AgentRecord = {
	id: string
	name: string
	instruction: string
	tools: ToolDefinition[]
	memory: Memory
}
