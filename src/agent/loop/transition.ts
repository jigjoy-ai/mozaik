import { LoopStateId } from "@agent/loop"

export interface LoopTransition {
	readonly occurredAt: Date
	readonly previousState: LoopStateId
	readonly nextState: LoopStateId
	readonly reason: string
	readonly operationId?: string
}
