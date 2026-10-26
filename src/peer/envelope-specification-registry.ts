import { EnvelopeSpecification } from "./envelope-specification"

export class EnvelopeSpecificationRegistry {
	private specifications: Map<string, EnvelopeSpecification> = new Map()

	get(id: string): EnvelopeSpecification | undefined {
		return this.specifications.get(id)
	}

	register(id: string, specification: EnvelopeSpecification): void {
		this.specifications.set(id, specification)
	}
}
