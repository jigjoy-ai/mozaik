import { UuidGenerator } from "@util/uuid-generator"
import { CreateAgentUseCase } from "src/mozaik/use-cases/create-agent"
import { InMemoryAgentRepository } from "src/mozaik/repositories/in-memory-agent-repository"
import { Tool } from "@inference/tool"
import { SituationHandler } from "@environment/situation-handler"
import { CreateAgentLoopUseCase } from "src/mozaik/use-cases/create-loop"
import { SystemClock } from "@util/system-clock"
import { InMemoryLoopRepository } from "src/mozaik/repositories/in-memory-loop-repository"
import { InferenceRunner } from "@inference/inference-runner"
import { AgentRepository } from "@agent/agent-repository"
import { LoopRepository } from "@agent/loop/repository"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"
import { ToolUseRunner } from "@inference/tool-use-runner"
import { LocalToolRunner } from "src/mozaik/runners/local-tool-runner"
import { DefaultInferenceRunner } from "src/mozaik/runners/inference-runner"
import { GenerativeModel } from "@inference/generative-model"
import { InferenceRequestValidator } from "@inference/request-validation/inference-request-validator"
import { supportedModels } from "@inference/models"
import { AgentRecord } from "./record"
import { LoopRecord } from "./loop/record"
import { Loop } from "./loop"
import { LoopController } from "./loop/controller"
import { AdvanceLoopUseCase } from "src/mozaik/use-cases/advance-loop"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export type AgentFamilyConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: LoopRepository
	clock?: Clock
	uuidGenerator?: IdGenerator
	inferenceRunnerConfig?: InferenceRunnerConfig
	toolRunner: ToolUseRunner
}

export function createAgentModule(config: AgentFamilyConfig) {
	// Dependencies
	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const uuidGenerator = config.uuidGenerator ?? new UuidGenerator()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryLoopRepository()
	const clock = config.clock ?? new SystemClock()

	const inferenceRunner =
		config.inferenceRunnerConfig?.runner ??
		new DefaultInferenceRunner(
			config.inferenceRunnerConfig?.supportedModels ?? supportedModels,
			new InferenceRequestValidator(),
		)

	const toolRunner = new LocalToolRunner()
	// Use cases
	const createAgentUseCase = new CreateAgentUseCase(agentRepository, uuidGenerator)
	const createLoopUseCase = new CreateAgentLoopUseCase(agentRepository, agentLoopRepository, uuidGenerator, clock)

	type CreateAgentParams = {
		name: string
		instruction: string
		capabilities: readonly string[]
		tools: Tool[]
		handlers: SituationHandler[]
	}
	// Interfaces
	async function createAgent(config: CreateAgentParams): Promise<AgentRecord> {
		return await createAgentUseCase.execute(
			config.name,
			config.instruction,
			config.capabilities,
			config.tools,
			config.handlers,
		)
	}

	type CreateLoopParams = {
		agentId: string
		subject: string
	}

	async function createLoop(config: CreateLoopParams): Promise<Loop> {
		return await createLoopUseCase.execute(config.agentId, config.subject)
	}

	const advanceLoopUseCase = new AdvanceLoopUseCase(agentLoopRepository)
	async function advanceLoop(loop: Loop, controller: LoopController): Promise<Loop> {
		return await advanceLoopUseCase.execute(loop, controller)
	}

	return {
		createAgent,
		createLoop,
		advanceLoop,
	}
}
