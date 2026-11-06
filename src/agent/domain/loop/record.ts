import type { CompleteDirective } from "@agent/domain/loop/directive"
import { LoopTransition } from "@agent/domain/loop/transition"
import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import { LoopStateId, PendingDirective } from "@agent/domain/loop/loop"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	inferenceRequest?: InferenceRequest
	transitionHistory: LoopTransition[]
	pendingDirective?: PendingDirective
	//completedDirectives: CompletedDirective[]
}
