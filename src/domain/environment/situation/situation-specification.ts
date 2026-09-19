import { SemanticEvent } from "@domain/environment/semantic-event/event"
import { Participant } from "../participant/participant"

export type SituationContext<TEvent extends SemanticEvent = SemanticEvent> = {
	readonly event: TEvent
	readonly participant: Participant
}

export abstract class SituationSpecification<TEvent extends SemanticEvent = SemanticEvent> {
	abstract isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean

	and(other: SituationSpecification<TEvent>): SituationSpecification<TEvent> {
		return new AndSituationSpecification(this, other)
	}

	or(other: SituationSpecification<TEvent>): SituationSpecification<TEvent> {
		return new OrSituationSpecification(this, other)
	}

	not(): SituationSpecification<TEvent> {
		return new NotSituationSpecification(this)
	}
}

class AndSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	constructor(
		private readonly left: SituationSpecification<TEvent>,
		private readonly right: SituationSpecification<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) && this.right.isSatisfiedBy(situationContext)
	}
}

class OrSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	constructor(
		private readonly left: SituationSpecification<TEvent>,
		private readonly right: SituationSpecification<TEvent>,
	) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return this.left.isSatisfiedBy(situationContext) || this.right.isSatisfiedBy(situationContext)
	}
}

class NotSituationSpecification<TEvent extends SemanticEvent> extends SituationSpecification<TEvent> {
	constructor(private readonly rule: SituationSpecification<TEvent>) {
		super()
	}

	isSatisfiedBy(situationContext: SituationContext<TEvent>): boolean {
		return !this.rule.isSatisfiedBy(situationContext)
	}
}
