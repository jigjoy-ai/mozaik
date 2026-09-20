import { AgentLoop } from "./agent-loop"

export interface AgentLoopRepository {
	save(agentLoop: AgentLoop): Promise<void>
	getById(id: string): Promise<AgentLoop | undefined>
}
