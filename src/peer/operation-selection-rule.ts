import { Specification } from "./specification"

export interface OperationSelectionRule<TContext> {
	specification: Specification<TContext>
	operationId: string
	priority: number
}
