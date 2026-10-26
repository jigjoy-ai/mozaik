import { Policy } from "@peer/policy"
import { RuleSpecificationRegistry } from "./rule-specification-registry"
import { Envelope } from "./envelope"

export class RuleEngine {
	constructor(private readonly specificationRegistry: RuleSpecificationRegistry) {}

	async decide(policy: Policy, envelope: Envelope<any>): Promise<string | undefined> {
		const satisfiedRules = []

		for (const rule of policy.getRules()) {
			const specification = this.specificationRegistry.get(rule.specification)
			if (specification?.isSatisfiedBy(envelope)) {
				satisfiedRules.push(rule)
			}
		}

		if (satisfiedRules.length === 0) {
			return undefined
		}

		return satisfiedRules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0].directive
	}
}
