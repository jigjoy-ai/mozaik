import { InMemoryAgentRepository } from "@agent/infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { RuntimeMemoryFactory } from "./infrastructure/memory/runtime-memory-factory"
import { AgentModule, AgentModuleConfig } from "@agent/types"
import { DirectiveProcessor } from "@peer/directive-processor"
import { DirectiveRegistry } from "@peer/directive-registry"
import { InMemoryPolicyRepository } from "./infrastructure/repositories/in-memory-policy-repository"
import { DefaultInferenceRunner } from "./application/runners/inference-runner"
import { supportedModels } from "./infrastructure/providers/supported-models"
import { InferenceRequestValidator } from "@inference/request-validation/inference-request-validator"
import { Inference } from "./application/operations/inference"
import { InputResolver } from "@peer/input-resolver"
import { InputResolverRegistry } from "@peer/input-resolver-registry"
import { RuleRegistry } from "@peer/rule-registry"
import { ConditionSpecification } from "@peer/condition-specification"

let module: AgentModule | undefined

export const specificationRegistry = new RuleRegistry()
export const inputResolverRegistry = new InputResolverRegistry()
const directiveRegistry = new DirectiveRegistry()

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryLoopRepository()
	const policyRepository = config.policyRepository ?? new InMemoryPolicyRepository()

	const models = config.inferenceRunnerConfig?.supportedModels ?? supportedModels

	const inferenceRunner = new DefaultInferenceRunner(models, new InferenceRequestValidator())

	const loopRepository = new InMemoryLoopRepository()
	const inferenceOperation = new Inference(loopRepository, inferenceRunner)
	directiveRegistry.register("inference", inferenceOperation)

	const directiveProcessor = config.directiveProcessor ?? new DirectiveProcessor(directiveRegistry)

	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()

	module = {
		agentRepository,
		agentLoopRepository,
		policyRepository,
		// inferenceRunner,
		directiveProcessor,
		memoryFactory,
	}
}

export function Input(options: { name: string }) {
	return function <T extends new () => InputResolver<unknown>>(
		ResolverClass: T,
		_context: ClassDecoratorContext,
	): void {
		inputResolverRegistry.register(options.name, new ResolverClass())
	}
}

export function Condition(options: { name: string }) {
	return function <T extends new () => ConditionSpecification>(
		SpecificationClass: T,
		_context: ClassDecoratorContext,
	): void {
		specificationRegistry.register(options.name, new SpecificationClass())
	}
}

function resolveAgentModule(): AgentModule {
	if (!module) {
		throw new Error("Agent module is not initialized")
	}

	return module
}

export { initAgentModule }
