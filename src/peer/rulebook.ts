import { RuleDefinition, Rule } from "@peer/rule"

export class Rulebook {
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

	static create(ruleDefinitions: RuleDefinition[]): Rulebook {
		const rules: Rule[] = []
		for (const ruleDefinition of ruleDefinitions) {
			const rule: Rule = {
				id: crypto.randomUUID(),
				specificationId: ruleDefinition.specificationId,
				operationId: ruleDefinition.operationId,
				priority: ruleDefinition.priority,
			}
			rules.push(rule)
		}

		const id = crypto.randomUUID()
		return new Rulebook(id, rules)
	}
}
