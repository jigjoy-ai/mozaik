import { InMemoryAgentRepository } from "@agent/infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { RuntimeMemoryFactory } from "./infrastructure/memory/runtime-memory-factory"
import { AgentModule, AgentModuleConfig } from "@agent/types"
import { DirectiveExecutor } from "@peer/directive-executor"
import { OperationRegistry } from "@peer/operation-registry"
import { InMemoryRulebookRepository } from "./infrastructure/repositories/in-memory-rulebook-repository"

let module: AgentModule | undefined

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryLoopRepository()
	const rulebookRepository = config.rulebookRepository ?? new InMemoryRulebookRepository()

	const operationRegistry = new OperationRegistry()

	//operationRegistry.register("inference", inferenceRunner)

	const directiveExecutor = config.directiveExecutor ?? new DirectiveExecutor(operationRegistry)

	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()

	module = {
		agentRepository,
		agentLoopRepository,
		rulebookRepository,
		// inferenceRunner,
		directiveExecutor,
		memoryFactory,
	}
}

function resolveAgentModule(): AgentModule {
	if (!module) {
		throw new Error("Agent module is not initialized")
	}

	return module
}

export { initAgentModule }
