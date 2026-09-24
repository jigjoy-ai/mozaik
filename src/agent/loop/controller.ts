import { Loop } from "@agent/loop"
import { LoopRule } from "@agent/loop/rule"
import { LoopControlDirective } from "@agent/loop/directive"

export class LoopController {
	_loop: Loop
	_rules: LoopRule[]

	constructor(loop: Loop, loopRules: LoopRule[]) {
		this._loop = loop
		this._rules = loopRules
	}

	get loop(): Loop {
		return this._loop
	}

	get rules(): LoopRule[] {
		return this._rules
	}

	set loop(loop: Loop) {
		this._loop = loop
	}

	set rules(rules: LoopRule[]) {
		this._rules = rules
	}

	decide(): LoopControlDirective | undefined {
		for (const rule of this._rules) {
			if (rule.when.isSatisfiedBy(this._loop)) {
				return rule.then(this._loop)
			}
		}
		return { type: "wait" }
	}

	addRule(rule: LoopRule): void {
		this._rules.push(rule)
	}

	removeRule(rule: LoopRule): void {
		this._rules = this._rules.filter((r) => r !== rule)
	}
}
