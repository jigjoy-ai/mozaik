import { ConditionSpecification } from "./condition-specification"

export class RuleRegistry {
	private specifications: Map<string, ConditionSpecification> = new Map()

	get(id: string): ConditionSpecification | undefined {
		return this.specifications.get(id)
	}

	register(id: string, specification: ConditionSpecification): void {
		this.specifications.set(id, specification)
	}
}
