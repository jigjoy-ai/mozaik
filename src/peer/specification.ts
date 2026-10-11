export abstract class Specification<TContext> {
	abstract isSatisfiedBy(context: TContext): boolean

	and(other: Specification<TContext>): Specification<TContext> {
		return new AndSpecification(this, other)
	}

	or(other: Specification<TContext>): Specification<TContext> {
		return new OrSpecification(this, other)
	}

	not(): Specification<TContext> {
		return new NotSpecification(this)
	}
}

export class AndSpecification<TContext> extends Specification<TContext> {
	constructor(
		private readonly left: Specification<TContext>,
		private readonly right: Specification<TContext>,
	) {
		super()
	}

	isSatisfiedBy(context: TContext): boolean {
		return this.left.isSatisfiedBy(context) && this.right.isSatisfiedBy(context)
	}
}

export class OrSpecification<TContext> extends Specification<TContext> {
	constructor(
		private readonly left: Specification<TContext>,
		private readonly right: Specification<TContext>,
	) {
		super()
	}

	isSatisfiedBy(context: TContext): boolean {
		return this.left.isSatisfiedBy(context) || this.right.isSatisfiedBy(context)
	}
}

export class NotSpecification<TContext> extends Specification<TContext> {
	constructor(private readonly rule: Specification<TContext>) {
		super()
	}

	isSatisfiedBy(context: TContext): boolean {
		return !this.rule.isSatisfiedBy(context)
	}
}
