import { Agent } from "@agent/index"
import { Context } from "@inference/context"
import { DirectiveDefinition } from "@peer/directive-definition"
import { DirectiveResult } from "@peer/directive-result"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

interface PendingDirective {
	directive: DirectiveDefinition<unknown>
	recipientId: string
	issuedAt: Date
}

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
	private pendingDirective?: PendingDirective

	// private history: Directive | DirectiveResult[] = []

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingDirective?: PendingDirective,
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingDirective = pendingDirective
	}

	issueDirective(directive: DirectiveDefinition<unknown>, recipientId: string): void {
		if (this.pendingDirective) {
			throw new Error("A directive is already pending")
		}

		this.pendingDirective = {
			directive,
			recipientId,
			issuedAt: new Date(),
		}
	}

	getPendingDirective(): PendingDirective | undefined {
		return this.pendingDirective
	}

	acceptResult(result: DirectiveResult<unknown>): void {
		if (this.pendingDirective?.directive.id !== result.directiveId) {
			throw new Error("Result does not match the pending directive")
		}

		// Record or apply the result before clearing the pending directive.
		this.pendingDirective = undefined
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
