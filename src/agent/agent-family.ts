import { UuidGenerator } from "@util/uuid-generator"
import { CreateAgentUseCase } from "@agent/application/use-cases/create-agent"
import { InMemoryAgentRepository } from "@agent/infrastructure/in-memory-agent-repository"
import { Tool } from "@inference/tool"
import { SituationHandler } from "@environment/domain/situation-handler"
import { CreateAgentLoopUseCase } from "@agent/application/use-cases/create-loop"
import { SystemClock } from "@util/system-clock"
import { InMemoryAgentLoopRepository } from "@agent/infrastructure/in-memory-agent-loop-repository"
import { InferenceRequest, InferenceResult, InferenceRunner } from "@inference/inference-runner"
import { ReceiveInferenceResultUseCase } from "@agent/application/use-cases/receive-inference-result"
import { ReceiveToolUseResultUseCase } from "@agent/application/use-cases/receieve-tool-use-result"
import { ToolUseRequest, ToolUseResult } from "@inference/context"
import { RequestInferenceUseCase } from "@agent/application/use-cases/request-inference"
import { RequestToolUseUseCase } from "@agent/application/use-cases/request-tool-use"
import { AgentRepository } from "@agent/domain/agent-repository"
import { AgentLoopRepository } from "@agent/domain/agent-loop-repository"
import { Clock } from "@util/clock"
import { IdGenerator } from "@util/id-generator"
import { ToolUseRunner } from "@inference/tool-use-runner"
import { LocalToolRunner } from "@agent/application/services/local-tool-runner"
import { DefaultInferenceRunner } from "@agent/application/services/inference-runner"
import { GenerativeModel } from "@inference/generative-model"
import { InferenceRequestValidator } from "@inference/request-validation/inference-request-validator"
import { supportedModels } from "@inference/models"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export type AgentFamilyConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: AgentLoopRepository
	clock?: Clock
	uuidGenerator?: IdGenerator
	inferenceRunnerConfig?: InferenceRunnerConfig
	toolRunner?: ToolUseRunner
}

export function defineAgentFamily(config: AgentFamilyConfig = {}) {
	// Dependencies
	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const uuidGenerator = config.uuidGenerator ?? new UuidGenerator()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryAgentLoopRepository()
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
	const createAgentLoopUseCase = new CreateAgentLoopUseCase(
		agentRepository,
		agentLoopRepository,
		uuidGenerator,
		clock,
	)
	const requestInferenceUseCase = new RequestInferenceUseCase(agentLoopRepository, uuidGenerator, clock)
	const receiveInferenceResultUseCase = new ReceiveInferenceResultUseCase(agentLoopRepository, clock)
	const requestToolUseUseCase = new RequestToolUseUseCase(agentLoopRepository, uuidGenerator, clock)
	const receiveToolUseResultUseCase = new ReceiveToolUseResultUseCase(agentLoopRepository, clock)

	// Interfaces
	const createAgent =
		() =>
		async (
			name: string,
			instruction: string,
			capabilities: readonly string[],
			tools: Tool[],
			handlers: SituationHandler[],
		) => {
			return await createAgentUseCase.execute(name, instruction, capabilities, tools, handlers)
		}

	const createAgentLoop = () => async (agentId: string, subject: string) => {
		return await createAgentLoopUseCase.execute(agentId, subject)
	}

	const receiveInferenceResult =
		() => async (agentLoopId: string, operationId: string, inferenceResult: InferenceResult) => {
			return await receiveInferenceResultUseCase.execute(agentLoopId, operationId, inferenceResult)
		}

	const requestInference = () => async (agentLoopId: string, request: InferenceRequest) => {
		return await requestInferenceUseCase.execute(agentLoopId, request)
	}

	const requestToolUse = () => async (agentLoopId: string, toolUseRequest: ToolUseRequest) => {
		return await requestToolUseUseCase.execute(agentLoopId, toolUseRequest)
	}

	const receiveToolOutput = (toolUseResult: ToolUseResult) => async (agentLoopId: string, operationId: string) => {
		return await receiveToolUseResultUseCase.execute(agentLoopId, operationId, toolUseResult)
	}

	return {
		createAgent,
		createAgentLoop,
		requestInference,
		receiveInferenceResult,
		requestToolUse,
		receiveToolOutput,
	}
}
