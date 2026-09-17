import { Participant } from "@domain/agentic-environment/participant/participant"
import { RuntimeState } from "@domain/agentic-environment/runtime-state"
import { EventProcessor } from "@domain/agentic-environment/semantic-event/event-processor"
import {
	ParticipantJoinedEvent,
	ParticipantLeftEvent,
	SemanticEvent,
} from "@domain/agentic-environment/semantic-event/event"
import { InferenceRunner } from "@domain/agentic-environment/loop/inference"
import { FunctionCallRunner } from "@domain/agentic-environment/loop/function-call"

export class RuntimeService<TRuntimeState extends RuntimeState> {
	constructor(
		public readonly state: TRuntimeState,
		private readonly processor: EventProcessor,
		private readonly inferenceRunner: InferenceRunner,
		private readonly functionCallRunner: FunctionCallRunner,
	) {}

	join(participant: Participant): void {
		this.state.addParticipant(participant)
		this.publish(ParticipantJoinedEvent.init(participant.getManifest()))
	}

	leave(participant: Participant): void {
		this.state.removeParticipant(participant)
		this.publish(ParticipantLeftEvent.init(participant.getManifest()))
	}

	publish(event: SemanticEvent): void {
		for (const participant of this.state.getParticipants()) {
			this.processor.process(event, participant)
		}
	}

	getParticipant(id: string): Participant | undefined {
		if (!this.state.getParticipant(id)) {
			throw new Error(`Participant ${id} not found`)
		}

		return this.state.getParticipant(id)
	}

	getInferenceRunner(): InferenceRunner {
		return this.inferenceRunner
	}

	getFunctionCallRunner(): FunctionCallRunner {
		return this.functionCallRunner
	}
}
