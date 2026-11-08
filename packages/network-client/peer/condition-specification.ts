import { Envelope } from "./envelope"

export abstract class ConditionSpecification {
	abstract isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> | boolean

	and(other: ConditionSpecification): ConditionSpecification {
		return new AndConditionSpecification(this, other)
	}

	or(other: ConditionSpecification): ConditionSpecification {
		return new OrConditionSpecification(this, other)
	}

	not(): ConditionSpecification {
		return new NotConditionSpecification(this)
	}
}

export class AndConditionSpecification extends ConditionSpecification {
	constructor(
		private readonly left: ConditionSpecification,
		private readonly right: ConditionSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) && (await this.right.isSatisfiedBy(envelope))
	}
}

export class OrConditionSpecification extends ConditionSpecification {
	constructor(
		private readonly left: ConditionSpecification,
		private readonly right: ConditionSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) || (await this.right.isSatisfiedBy(envelope))
	}
}

export class NotConditionSpecification extends ConditionSpecification {
	constructor(private readonly condition: ConditionSpecification) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return !(await this.condition.isSatisfiedBy(envelope))
	}
}
