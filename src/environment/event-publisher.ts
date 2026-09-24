import { RuntimeEvent } from "./event"
import { Participant } from "./participant"

export class EventPublisher {
	publish(event: RuntimeEvent, subscribers: Participant[]): void {
		for (const subscriber of subscribers) {
			subscriber.getHandlers().forEach((handler) => {
				if (handler.specification.isSatisfiedBy({ event, participant: subscriber })) {
					handler.processor.apply({ event, participant: subscriber })
				}
			})
		}
	}
}
