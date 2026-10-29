import { AgentLoop } from "@agent/domain/loop/loop"

export interface InputResolver<T> {
	resolve(agentLoop: AgentLoop): Promise<T>
}
