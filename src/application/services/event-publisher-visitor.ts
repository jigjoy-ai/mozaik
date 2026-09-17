import { LoopTransition, ModelMessageParams, ReceivedMessage } from "@domain/agentic-environment/loop/loop-state"
import { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallParams } from "@domain/agentic-environment/loop/function-call"
import { RuntimeService } from "@app/services/runtime"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"
import { CloudClient, createCloudClient } from "@mozaik-ai/cloud-sdk"
import { Agent } from "@domain/agentic-environment/participant/agent"
import { InferenceInput, InferenceOutput } from "@domain/agentic-environment/loop/inference"

export class EventPublisherLoopVisitor implements LoopVisitor {
	private readonly cloud: CloudClient
	constructor(
		private readonly agentId: string,
		private readonly loopId: string,
		private readonly runtime: RuntimeService<RuntimeState>,
	) {
		this.cloud = createCloudClient()
	}

	visitMessageReceivedStarted(input: ReceivedMessage): void {
		this.publish("message_received.started", input)
	}

	visitMessageReceivedCompleted(output: InferenceInput): void {
		this.publish("message_received.completed", output)
	}

	visitInferenceStarted(input: InferenceInput): void {
		this.publish("inference.started", input)
	}

	visitInferenceEvent(event: SemanticEvent): void {
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
		const event = new SemanticEvent(type, this.agentId, new Date(), {
			...payload,
			loopId: this.loopId,
		})
		this.runtime.publish(event)

		if (this.cloud.enabled) {
			const participant = this.runtime.getParticipant(this.agentId)
			const agent = participant as Agent
			if (agent) {
				this.cloud.send({
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
