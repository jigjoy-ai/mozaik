import { Envelope } from "./envelope"

export abstract class RuleSpecification {
	abstract isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> | boolean

	and(other: RuleSpecification): RuleSpecification {
		return new AndRuleSpecification(this, other)
	}

	or(other: RuleSpecification): RuleSpecification {
		return new OrRuleSpecification(this, other)
	}

	not(): RuleSpecification {
		return new NotRuleSpecification(this)
	}
}

export class AndRuleSpecification extends RuleSpecification {
	constructor(
		private readonly left: RuleSpecification,
		private readonly right: RuleSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) && (await this.right.isSatisfiedBy(envelope))
	}
}

export class OrRuleSpecification extends RuleSpecification {
	constructor(
		private readonly left: RuleSpecification,
		private readonly right: RuleSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) || (await this.right.isSatisfiedBy(envelope))
	}
}

export class NotRuleSpecification extends RuleSpecification {
	constructor(private readonly rule: RuleSpecification) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return !(await this.rule.isSatisfiedBy(envelope))
	}
}
