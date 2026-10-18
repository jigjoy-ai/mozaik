import { Operation } from "./operation"

export class OperationRegistry {
	private operations: Map<string, Operation> = new Map()
	register(contractId: string, operation: Operation): void {
		this.operations.set(contractId, operation)
	}
	get(contractId: string): Operation {
		const operation = this.operations.get(contractId)
		if (!operation) {
			throw new Error(`Operation with contractId ${contractId} not found`)
		}
		return operation
	}
	list(): Operation[] {
		return Array.from(this.operations.values())
	}
}
