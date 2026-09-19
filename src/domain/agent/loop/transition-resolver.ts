import { LoopTransitionRule } from "./transition-rule"
import { LoopStateExecution, LoopTransition } from "./loop-state"

export class TransitionResolver {
	constructor(private readonly rules: LoopTransitionRule[]) {}

	resolve(execution: LoopStateExecution): LoopTransition {
		const rule = this.rules.find((rule) => rule.specification.isSatisfiedBy(execution))

		if (!rule) {
			throw new Error(`No transition rule found after "${execution.stateId}"`)
		}

		return rule.createTransition(execution)
	}
}
