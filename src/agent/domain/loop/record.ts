import { LoopTransition } from "@agent/domain/loop/transition"
import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import { LoopStateId } from "@agent/domain/loop/loop"
import { CompletedOperation, PendingOperation } from "@agent/domain/loop/operation"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	inferenceRequest?: InferenceRequest
	transitionHistory: LoopTransition[]
	pendingDirective?: PendingOperation
	completedOperations: CompletedOperation[]
}
