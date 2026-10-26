import { MemoryFactory } from "@agent/domain/memory"
import { GenerativeModel } from "@inference/generative-model"
import { InferenceRunner } from "@inference/inference-runner"
import { AgentRepository } from "@agent/domain/agent-repository"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { DirectiveProcessor } from "@peer/directive-processor"
import { Contract } from "@peer/contract"
import { RulebookRepository } from "../peer/rulebook-repository"

type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

type AgentModuleConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: LoopRepository
	rulebookRepository?: RulebookRepository
	inferenceRunnerConfig?: InferenceRunnerConfig
	directiveProcessor?: DirectiveProcessor
	memoryFactory?: MemoryFactory
}

type AgentModule = {
	agentRepository: AgentRepository
	agentLoopRepository: LoopRepository
	rulebookRepository: RulebookRepository
	//inferenceRunner: InferenceRunner
	directiveProcessor: DirectiveProcessor
	memoryFactory: MemoryFactory
}

type CreateAgentParams = {
	name: string
	instruction: string
	tools: Contract[]
}

export type { InferenceRunnerConfig, AgentModuleConfig, AgentModule, CreateAgentParams }
