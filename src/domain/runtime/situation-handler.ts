import { RuntimeEvent } from "./event"
import { Participant } from "./participant"
import { SituationSpecification } from "./situation-specification"

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
