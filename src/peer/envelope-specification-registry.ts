import { EnvelopeSpecification } from "./envelope-specification"

export class EnvelopeSpecificationRegistry {
	private specifications: Map<string, EnvelopeSpecification> = new Map()

	getSpecification(id: string): EnvelopeSpecification | undefined {
		return this.specifications.get(id)
	}

	registerSpecification(id: string, specification: EnvelopeSpecification): void {
		this.specifications.set(id, specification)
	}
}
