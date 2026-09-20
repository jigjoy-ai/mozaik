import { RuntimeService } from "@app/services/runtime"
import { DomainModel } from "@domain/runtime/domain-model"
import { InferenceRunner } from "@domain/generative-model/inference-runner"
import { supportedModels } from "@app/services/models"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { InferenceRequestValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { DefaultInferenceRunner } from "@app/services/inference-runner"
import { LocalToolUseRunner } from "@app/services/function-call"
import { CreateAgentUseCase } from "@app/use-cases/create-agent"
import { Agent } from "@domain/agent/agent"
import { Tool } from "@domain/generative-model/tool"
import { SituationHandler } from "@domain/runtime/situation-handler"
import { AgentRepository } from "@domain/agent/agent-repository"
import { CreateParticipantUseCase } from "@app/use-cases/create-participant"
import { IdGenerator } from "@domain/common/id-generator"

export type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	runner?: InferenceRunner
}

export class InMemoryAgentRepository implements AgentRepository {
	exists(id: string): Promise<boolean> {
		throw new Error("Method not implemented.")
	}
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
				new InferenceRequestValidator(),
			)

		const toolUseRunner = new LocalToolUseRunner()

		runtime = new RuntimeService(config.model, inferenceRunner, toolUseRunner)

		return runtime
	}

	function resolveRuntime(): RuntimeService<TModel> {
		if (!runtime) {
			throw new Error("Runtime not initialized")
		}

		return runtime
	}

	const createAgentUseCase = new CreateAgentUseCase(new InMemoryAgentRepository(), new IdGenerator())

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
	const createParticipantUseCase = new CreateParticipantUseCase()

	const createParticipant = async (name: string, capabilities: readonly string[], handlers: SituationHandler[]) => {
		return await createParticipantUseCase.execute(name, capabilities, handlers)
	}

	// const join = () => async (participant: Participant) => {
	// 	resolveRuntime().join(participant)
	// }
	// const leave = () => async (participant: Participant) => {
	// 	resolveRuntime().leave(participant)
	// }
	// const sendMessage = createSendMessage(resolveRuntime)
	// const sendEvent = createSendEvent(resolveRuntime)

	return {
		initializeRuntime,
		resolveRuntime,
		createAgent,
		createParticipant,
		// join,
		// leave,
		// sendMessage,
		// sendEvent,
	}
}
