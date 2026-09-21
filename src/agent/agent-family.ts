import { UuidGenerator } from "src/util/uuid-generator"
import { CreateAgentUseCase } from "./application/use-cases/create-agent"
import { InMemoryAgentRepository } from "./infrastructure/in-memory-agent-repository"
import { Tool } from "src/generative-model/tool"
import { SituationHandler } from "@domain/runtime/situation-handler"
import { CreateAgentLoopUseCase } from "./application/use-cases/create-loop"
import { SystemClock } from "src/util/system-clock"
import { InMemoryAgentLoopRepository } from "./infrastructure/in-memory-agent-loop-repository"
import { InferenceRequest, InferenceResult } from "src/generative-model/inference-runner"
import { ReceiveInferenceResultUseCase } from "./application/use-cases/receive-inference-result"
import { ReceiveToolUseResultUseCase } from "./application/use-cases/receieve-tool-use-result"
import { ToolUseResult } from "src/generative-model/context/items/tool-use-result"
import { RequestInferenceUseCase } from "./application/use-cases/request-inference"
import { RequestToolUseUseCase } from "./application/use-cases/request-tool-use"
import { ToolUseRequest } from "src/generative-model/context/items/tool-use-request"
import { AgentRepository } from "./domain/agent-repository"
import { AgentLoopRepository } from "./domain/agent-loop-repository"
import { Clock } from "src/util/clock"
import { IdGenerator } from "src/util/id-generator"

export type AgentFamilyConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: AgentLoopRepository
	clock?: Clock
	uuidGenerator?: IdGenerator
}

export function defineAgentFamily(config: AgentFamilyConfig = {}) {
	// Dependencies
	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const uuidGenerator = config.uuidGenerator ?? new UuidGenerator()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryAgentLoopRepository()
	const clock = config.clock ?? new SystemClock()

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

	const createAgentLoop = () => async (agentId: string, inferenceRequest: InferenceRequest) => {
		return await createAgentLoopUseCase.execute(agentId, inferenceRequest)
	}

	const receiveInferenceResult =
		() => async (agentLoopId: string, operationId: string, inferenceResult: InferenceResult) => {
			return await receiveInferenceResultUseCase.execute(agentLoopId, operationId, inferenceResult)
		}

	const requestInference = () => async (agentLoopId: string) => {
		return await requestInferenceUseCase.execute(agentLoopId)
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
