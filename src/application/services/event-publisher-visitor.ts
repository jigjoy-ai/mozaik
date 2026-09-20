import { LoopTransition, ModelMessageParams, ReceivedMessage } from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { FunctionCallParams } from "@domain/agent/loop/states/function-call"
import { RuntimeEvent } from "@domain/runtime/event"
import { CloudClient } from "@mozaik-ai/cloud-sdk"
import { Agent } from "@domain/agent/agent"
import { InferenceInput, InferenceOutput } from "@domain/generative-model/inference-runner"
import { Environment } from "@domain/runtime/environment"

export class EventPublisherLoopVisitor implements LoopVisitor {
	constructor(
		private readonly agentId: string,
		private readonly loopId: string,
		private readonly environment: Environment,
		private readonly cloudClient: CloudClient,
	) {}

	visitMessageReceivedStarted(input: ReceivedMessage): void {
		this.publish("message_received.started", input)
	}

	visitMessageReceivedCompleted(output: InferenceInput): void {
		this.publish("message_received.completed", output)
	}

	visitInferenceStarted(input: InferenceInput): void {
		this.publish("inference.started", input)
	}

	visitInferenceEvent(event: RuntimeEvent): void {
		this.publish("inference.stream", event)
	}

	visitInferenceCompleted(output: InferenceOutput): void {
		this.publish("inference.completed", output)
	}

	visitFunctionCallStarted(input: FunctionCallParams): void {
		this.publish("function_call.started", input)
	}

	visitFunctionCallCompleted(output: FunctionCallOutputItem): void {
		this.publish("function_call.completed", output)
	}

	visitModelAnswer(input: ModelMessageParams): void {
		this.publish("model.answer", input)
	}

	visitInterceptionStarted(transition: LoopTransition): void {
		this.publish("interception.started", transition)
	}

	visitInterceptionFinished(transition: LoopTransition): void {
		this.publish("interception.finished", transition)
	}

	private publish<TPayload>(type: string, payload: TPayload): void {
		const event = new RuntimeEvent(type, this.agentId, new Date(), {
			...payload,
			loopId: this.loopId,
		})
		this.environment.publish(event)

		if (this.cloudClient.enabled) {
			const participant = this.environment.getParticipant(this.agentId)
			const agent = participant as Agent
			if (agent) {
				this.cloudClient.send({
					...event,
					payload: {
						...payload,
						loopId: this.loopId,
						agent: {
							manifest: agent.getManifest(),
							developerMessage: agent.getDeveloperMessage(),
							tools: agent.getTools(),
							memory: agent.getMemory().getContext().getItems(),
						},
					},
				})
			}
		}
	}
}
