import { Rule, RuleDefinition } from "@peer/rule"

export class Policy {
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

	static create(ruleDefinitions: RuleDefinition[]): Policy {
		const rules: Rule[] = []
		for (const ruleDefinition of ruleDefinitions) {
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
		return new Policy(id, rules)
	}
}
