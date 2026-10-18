import { Memory } from "@agent/domain/memory"
import { Contract } from "@peer/contract"

export type AgentRecord = {
	id: string
	name: string
	instruction: string
	tools: Contract[]
	memory: Memory
}
