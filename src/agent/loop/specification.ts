import { Loop } from "@agent/loop"

export abstract class LoopSpecification {
	abstract isSatisfiedBy(loop: Loop): boolean

	and(other: LoopSpecification): LoopSpecification {
		return new AndLoopSpecification(this, other)
	}

	or(other: LoopSpecification): LoopSpecification {
		return new OrLoopSpecification(this, other)
	}

	not(): LoopSpecification {
		return new NotLoopSpecification(this)
	}
}

class AndLoopSpecification extends LoopSpecification {
	constructor(
		private readonly left: LoopSpecification,
		private readonly right: LoopSpecification,
	) {
		super()
	}

	isSatisfiedBy(loop: Loop): boolean {
		return this.left.isSatisfiedBy(loop) && this.right.isSatisfiedBy(loop)
	}
}

class OrLoopSpecification extends LoopSpecification {
	constructor(
		private readonly left: LoopSpecification,
		private readonly right: LoopSpecification,
	) {
		super()
	}

	isSatisfiedBy(loop: Loop): boolean {
		return this.left.isSatisfiedBy(loop) || this.right.isSatisfiedBy(loop)
	}
}

class NotLoopSpecification extends LoopSpecification {
	constructor(private readonly rule: LoopSpecification) {
		super()
	}

	isSatisfiedBy(loop: Loop): boolean {
		return !this.rule.isSatisfiedBy(loop)
	}
}
