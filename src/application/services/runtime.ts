import { Participant } from "@domain/environment/participant/participant"
import { DomainModel } from "@domain/environment/runtime-state"
import { EventProcessor } from "@domain/environment/semantic-event/event-processor"
import { ParticipantJoinedEvent, ParticipantLeftEvent, SemanticEvent } from "@domain/environment/semantic-event/event"
import { InferenceRunner } from "@domain/agent/loop/states/inference"
import { FunctionCallRunner } from "@domain/agent/loop/states/function-call"

export class RuntimeService<TModel extends DomainModel> {
	constructor(
		public readonly model: TModel,
		private readonly processor: EventProcessor,
		private readonly inferenceRunner: InferenceRunner,
		private readonly functionCallRunner: FunctionCallRunner,
	) {}

	join(participant: Participant): void {
		this.publish(ParticipantJoinedEvent.init(participant.getManifest()))
	}

	leave(participant: Participant): void {
		this.publish(ParticipantLeftEvent.init(participant.getManifest()))
	}

	publish(event: SemanticEvent): void {
		// for (const participant of this.model.getParticipants()) {
		// 	this.processor.process(event, participant)
		// }
	}

	getParticipant(id: string): Participant | undefined {
		// if (!this.model.getParticipant(id)) {
		// 	throw new Error(`Participant ${id} not found`)
		// }

		// return this.model.getParticipant(id)
		return
	}

	getInferenceRunner(): InferenceRunner {
		return this.inferenceRunner
	}

	getFunctionCallRunner(): FunctionCallRunner {
		return this.functionCallRunner
	}
}
