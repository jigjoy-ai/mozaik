import { Envelope } from "./envelope"

export abstract class EnvelopeSpecification {
	abstract isSatisfiedBy(envelope: Envelope<any>): Promise<boolean>

	and(other: EnvelopeSpecification): EnvelopeSpecification {
		return new AndEnvelopeSpecification(this, other)
	}

	or(other: EnvelopeSpecification): EnvelopeSpecification {
		return new OrEnvelopeSpecification(this, other)
	}

	not(): EnvelopeSpecification {
		return new NotEnvelopeSpecification(this)
	}
}

export class AndEnvelopeSpecification extends EnvelopeSpecification {
	constructor(
		private readonly left: EnvelopeSpecification,
		private readonly right: EnvelopeSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) && (await this.right.isSatisfiedBy(envelope))
	}
}

export class OrEnvelopeSpecification extends EnvelopeSpecification {
	constructor(
		private readonly left: EnvelopeSpecification,
		private readonly right: EnvelopeSpecification,
	) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return (await this.left.isSatisfiedBy(envelope)) || (await this.right.isSatisfiedBy(envelope))
	}
}

export class NotEnvelopeSpecification extends EnvelopeSpecification {
	constructor(private readonly rule: EnvelopeSpecification) {
		super()
	}

	async isSatisfiedBy(envelope: Envelope<any>): Promise<boolean> {
		return !(await this.rule.isSatisfiedBy(envelope))
	}
}
