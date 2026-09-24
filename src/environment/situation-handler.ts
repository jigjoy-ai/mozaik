import { RuntimeEvent } from "@environment/event"
import { Participant } from "@environment/participant"
import { SituationSpecification } from "@environment/situation-specification"

export interface SituationHandler {
	readonly specification: SituationSpecification
	readonly processor: SituationProcessor
}

export type SituationContext<TEvent extends RuntimeEvent = RuntimeEvent> = {
	readonly event: TEvent
	readonly participant: Participant
}

export interface SituationProcessor {
	apply(context: SituationContext): void | Promise<void>
}
