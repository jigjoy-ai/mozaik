import { Agent } from "@agent/index"
import type { Context } from "@agent/domain/inference/context"
import { CompletedOperation, PendingOperation } from "./operation"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export type AgentLoop = {
	agent: Agent
	loop: Loop
}

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pendingOperation: PendingOperation | undefined
	completedOperations: CompletedOperation[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingOperation: PendingOperation | undefined,
		completedOperations: CompletedOperation[] = [],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingOperation = pendingOperation
		this.completedOperations = completedOperations
	}

	issueOperation(operation: PendingOperation): void {
		if (this.pendingOperation) {
			throw new Error("An operation is already pending")
		}

		this.pendingOperation = operation
	}

	getPendingOperation(): PendingOperation | undefined {
		return this.pendingOperation
	}

	acceptResult(result: CompletedOperation): void {
		if (this.pendingOperation?.id !== result.operationId) {
			throw new Error("Result does not match the pending directive")
		}

		this.pendingOperation = undefined
		this.completedOperations.push(result)
	}

	handoff(recipientId: string): void {
		this.assignee = recipientId
	}

	pause(): void {
		this.state = "paused"
	}

	stop(): void {
		this.state = "stopped"
	}

	end(): void {
		this.state = "completed"
	}
}
