import { AgentLoop } from "@agent/domain/agent-loop"
import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"

export class InMemoryAgentLoopRepository implements AgentLoopRepository {
	private agentLoops: AgentLoop[] = []

	getById(id: string): Promise<AgentLoop | undefined> {
		return Promise.resolve(this.agentLoops.find((agentLoop) => agentLoop.id === id))
	}
	save(agentLoop: AgentLoop): Promise<void> {
		this.agentLoops.push(agentLoop)
		return Promise.resolve()
	}
}
