import { MemoryFactory } from "@agent/domain/memory"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { InferenceRunner } from "@agent/domain/inference/inference-runner"
import { AgentRepository } from "@agent/domain/agent-repository"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { DirectiveProcessor } from "@peer/directive-processor"
import { ToolDefinition } from "@agent/domain/inference/tool"

type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

type AgentModuleConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: LoopRepository
	inferenceRunnerConfig?: InferenceRunnerConfig
	directiveProcessor?: DirectiveProcessor
	memoryFactory?: MemoryFactory
}

type AgentModule = {
	agentRepository: AgentRepository
	agentLoopRepository: LoopRepository
	//inferenceRunner: InferenceRunner
	directiveProcessor: DirectiveProcessor
	memoryFactory: MemoryFactory
}

type CreateAgentParams = {
	name: string
	instruction: string
	tools: ToolDefinition[]
}

export type { InferenceRunnerConfig, AgentModuleConfig, AgentModule, CreateAgentParams }
