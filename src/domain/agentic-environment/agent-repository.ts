import { Agent } from "./participant/agent"

export interface AgentRepository {
	save(agent: Agent): Promise<void>
	getById(id: string): Promise<Agent | undefined>
	getAll(): Promise<Agent[]>
}
