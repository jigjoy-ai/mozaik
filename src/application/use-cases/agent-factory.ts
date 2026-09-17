import { Agent } from "@domain/agentic-environment/participant/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/agentic-environment/situation/situation-handler"
import { RuntimeService } from "@app/services/runtime"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"

export function AgentFactory<TRuntimeState extends RuntimeState>(resolveRuntime: () => RuntimeService<TRuntimeState>) {
	return function createAgent(
		name: string,
		instruction: string,
		capabilities: readonly string[],
		tools: Tool[],
		handlers: SituationHandler[],
	): Agent {
		return Agent.create({ name, instruction, capabilities, tools, handlers })
	}
}
