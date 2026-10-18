import { Rulebook } from "@peer/rulebook"
import { EnvelopeSpecificationRegistry } from "./envelope-specification-registry"
import { Envelope } from "./envelope"

export class EnvelopeRuleEngine {
	constructor(private readonly specificationRegistry: EnvelopeSpecificationRegistry) {}

	async decide(rulebook: Rulebook, envelope: Envelope<any>): Promise<string | undefined> {
		const satisfiedRules = []

		for (const rule of rulebook.getRules()) {
			const specification = this.specificationRegistry.getSpecification(rule.specificationId)
			if (specification?.isSatisfiedBy(envelope)) {
				satisfiedRules.push(rule)
			}
		}

		if (satisfiedRules.length === 0) {
			return undefined
		}

		return satisfiedRules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0].operationId
	}
}
