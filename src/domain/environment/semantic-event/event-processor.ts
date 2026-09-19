import { SemanticEvent } from "@domain/environment/semantic-event/event"
import { Participant } from "@domain/environment/participant/participant"

export class EventProcessor {
	process(event: SemanticEvent, consumer: Participant): void {
		for (const handler of consumer.getHandlers()) {
			const isSatisfied = handler.specification.isSatisfiedBy({
				event,
				participant: consumer,
			})
			if (isSatisfied) {
				handler.processor.apply({ event, participant: consumer })
			}
		}
	}
}
