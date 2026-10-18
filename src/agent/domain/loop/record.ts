import { CompletedOperation, PendingOperation } from "@agent/domain/loop/operation"
import { LoopTransition } from "@agent/domain/loop/transition"
import { InferenceRequest } from "@inference/inference-request"
import { LoopStateId } from "@agent/domain/loop/loop"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	inferenceRequest?: InferenceRequest
	pendingOperation?: PendingOperation
	transitionHistory: LoopTransition[]
	operationHistory: CompletedOperation[]
}
