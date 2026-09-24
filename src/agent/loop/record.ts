import { CompletedOperation, PendingOperation } from "@agent/loop/operation"
import { LoopTransition } from "@agent/loop/transition"
import { InferenceRequest } from "@agent/inference/inference-runner"
import { LoopStateId } from "@agent/loop"

export interface LoopRecord {
	id: string
	subject: string
	createdAt: Date
	state: LoopStateId
	inferenceRequest?: InferenceRequest
	pendingOperation?: PendingOperation
	transitionHistory: LoopTransition[]
	operationHistory: CompletedOperation[]
}
