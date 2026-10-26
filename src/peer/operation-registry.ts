import { Operation } from "./operation"

export class OperationRegistry {
	private operations: Map<string, Operation> = new Map()

	register(contractId: string, operation: Operation): void {
		this.operations.set(contractId, operation)
	}

	get(contractId: string): Operation | undefined {
		const operation = this.operations.get(contractId)
		return operation
	}

	list(): Operation[] {
		return Array.from(this.operations.values())
	}
}
