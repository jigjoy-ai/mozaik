import { SemanticEvent } from "./event"
import { Participant } from "./participant"

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
