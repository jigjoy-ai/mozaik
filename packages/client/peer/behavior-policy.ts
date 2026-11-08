import { Rule, RuleDefinition } from "./rule"
import { BehaviorPolicyDefinition } from "../network-client"

export class BehaviorPolicy {
	private id: string
	private rules: Rule[]

	private constructor(id: string, rules: Rule[]) {
		this.id = id
		this.rules = rules
	}

	addRule(rule: Rule): void {
		this.rules.push(rule)
	}

	removeRule(rule: Rule): void {
		this.rules = this.rules.filter((r) => r.id !== rule.id)
	}

	getId(): string {
		return this.id
	}

	getRules(): readonly Rule[] {
		return this.rules
	}

	static create(policyDefinition: BehaviorPolicyDefinition): BehaviorPolicy {
		const rules: Rule[] = []
		for (const ruleDefinition of policyDefinition.rules) {
			const rule: Rule = {
				id: crypto.randomUUID(),
				condition: ruleDefinition.condition,
				input: ruleDefinition.input,
				directive: ruleDefinition.directive,
				priority: ruleDefinition.priority,
			}
			rules.push(rule)
		}

		const id = crypto.randomUUID()
		return new BehaviorPolicy(id, rules)
	}
}
