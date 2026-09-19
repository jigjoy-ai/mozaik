import { RuntimeService } from "@app/services/runtime"
import { Participant } from "@domain/environment/participant"
import { DomainModel } from "@domain/environment/runtime-state"
import { EventProcessor } from "@domain/environment/event-processor"
import { createSendMessage } from "@app/use-cases/send-message"
import { createRunLoop } from "@app/use-cases/run-loop"
import { InferenceRunner } from "@domain/generative-model/inference-runner"
import { supportedModels } from "@app/services/models"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceInputValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { DefaultInferenceRunner } from "@app/services/inference-runner"
import { DefaultFunctionCallRunner } from "@app/services/function-call"
import { createSendEvent } from "@app/use-cases/send-event"
import { CreateAgentUseCase } from "@app/use-cases/create-agent"
import { ParticipantFactory } from "@app/use-cases/paricipant-factory"
import { Agent } from "@domain/agent/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/environment/situation-handler"
import { AgentRepository } from "@domain/agent/agent-repository"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export class InMemoryAgentRepository implements AgentRepository {
	getById(id: string): Promise<Agent | undefined> {
		throw new Error("Method not implemented.")
	}
	getAll(): Promise<Agent[]> {
		throw new Error("Method not implemented.")
	}
	private readonly agents: Agent[] = []

	async save(agent: Agent): Promise<void> {
		this.agents.push(agent)
	}
}

export function defineRuntime<TModel extends DomainModel>() {
	let runtime: RuntimeService<TModel> | null = null
	const processor = new EventProcessor()

	function initializeRuntime(config: {
		model: TModel
		inferenceRunnerConfig?: InferenceRunnerConfig
	}): RuntimeService<TModel> {
		if (runtime) {
			throw new Error("Runtime already initialized")
		}

		const inferenceRunner =
			config.inferenceRunnerConfig?.runner ??
			new DefaultInferenceRunner(
				config.inferenceRunnerConfig?.supportedModels ?? supportedModels,
				new InferenceInputValidator(),
			)

		const functionCallRunner = new DefaultFunctionCallRunner()

		runtime = new RuntimeService(config.model, processor, inferenceRunner, functionCallRunner)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TModel> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	const createAgentUseCase = new CreateAgentUseCase(new InMemoryAgentRepository())

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
	const createParticipant = ParticipantFactory(resolveRuntime)

	const join = () => async (participant: Participant) => {
		resolveRuntime().join(participant)
	}
	const leave = () => async (participant: Participant) => {
		resolveRuntime().leave(participant)
	}
	const sendMessage = createSendMessage(resolveRuntime)
	const sendEvent = createSendEvent(resolveRuntime)
	const runLoop = createRunLoop(resolveRuntime)

	return {
		initializeRuntime,
		resolveRuntime,
		createAgent,
		createParticipant,
		join,
		leave,
		sendMessage,
		sendEvent,
		runLoop,
	}
}
