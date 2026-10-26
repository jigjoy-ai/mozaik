import { RuleSpecification } from "./rule-specification"

export class RuleSpecificationRegistry {
	private specifications: Map<string, RuleSpecification> = new Map()

	get(id: string): RuleSpecification | undefined {
		return this.specifications.get(id)
	}

	register(id: string, specification: RuleSpecification): void {
		this.specifications.set(id, specification)
	}
}
