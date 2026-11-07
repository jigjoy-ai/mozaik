import { InMemoryAgentRepository } from "@agent/infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { RuntimeMemoryFactory } from "@agent/infrastructure/memory/runtime-memory-factory"
import { AgentModule, AgentModuleConfig } from "@agent/types"
import { DefaultInferenceRunner } from "@agent/application/runners/inference-runner"
import { supportedModels } from "@agent/infrastructure/providers/supported-models"
import { InferenceRequestValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import { Inference } from "@agent/application/operations/inference"

let module: AgentModule | undefined

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryLoopRepository()

	const models = config.inferenceRunnerConfig?.supportedModels ?? supportedModels

	const inferenceRunner = new DefaultInferenceRunner(models, new InferenceRequestValidator())

	const loopRepository = new InMemoryLoopRepository()
	const inferenceOperation = new Inference(loopRepository, inferenceRunner)

	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()

	module = {
		agentRepository,
		agentLoopRepository,
		// inferenceRunner,
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
