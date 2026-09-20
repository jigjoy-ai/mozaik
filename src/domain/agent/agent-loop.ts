import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { InferenceInput, InferenceOutput } from "@domain/generative-model/inference-runner"

export type LoopStateId = "idle" | "awaiting_inference" | "awaiting_tool_output" | "stopped" | "completed"

export type PendingOperation =
	| {
			readonly id: string
			readonly type: "inference"
			readonly requestedAt: Date
			readonly request: InferenceInput
	  }
	| {
			readonly id: string
			readonly type: "tool_execution"
			readonly requestedAt: Date
			readonly call: FunctionCallItem
	  }

export interface LoopExecutionRecord {
	readonly id: string
	readonly occurredAt: Date
	readonly previousState: LoopStateId
	readonly nextState: LoopStateId
	readonly reason: string
	readonly operationId?: string
}

interface AgentLoopSnapshot {
	id: string
	state: LoopStateId
	inferenceInput: InferenceInput
	pendingOperation?: PendingOperation
	executionHistory: LoopExecutionRecord[]
}

export class AgentLoop {
	private readonly loopId: string
	private state: LoopStateId = "idle"
	private pendingOperation: PendingOperation | undefined
	private readonly executionHistory: LoopExecutionRecord[] = []
	private readonly inferenceInput: InferenceInput

	private constructor(
		loopId: string,
		state: LoopStateId,
		inferenceInput: InferenceInput,
		pendingOperation: PendingOperation | undefined,
		executionHistory: LoopExecutionRecord[],
	) {
		this.loopId = loopId
		this.state = state
		this.inferenceInput = inferenceInput
		this.pendingOperation = pendingOperation
		this.executionHistory = executionHistory
	}

	get id(): string {
		return this.loopId
	}

	get stateId(): LoopStateId {
		return this.state
	}

	get pending(): PendingOperation | undefined {
		return this.pendingOperation
	}

	get history(): readonly LoopExecutionRecord[] {
		return this.executionHistory
	}

	moveToIdle(reason: string, occurredAt: Date): void {
		this.transitionTo("idle", reason, occurredAt)
		this.pendingOperation = undefined
	}

	moveToAwaitingInference(operation: Extract<PendingOperation, { type: "inference" }>, occurredAt: Date): void {
		this.assertIdle()
		this.pendingOperation = operation

		this.transitionTo("awaiting_inference", "inference_requested", occurredAt, operation.id)
	}

	moveToAwaitingToolOutput(operation: Extract<PendingOperation, { type: "tool_execution" }>, occurredAt: Date): void {
		this.assertIdle()
		this.pendingOperation = operation

		this.transitionTo("awaiting_tool_output", "tool_execution_requested", occurredAt, operation.id)
	}

	private transitionTo(nextState: LoopStateId, reason: string, occurredAt: Date, operationId?: string): void {
		const previousState = this.state
		this.state = nextState

		this.executionHistory.push({
			id: crypto.randomUUID(),
			occurredAt,
			previousState,
			nextState,
			reason,
			operationId,
		})
	}

	private assertIdle(): void {
		if (this.state !== "idle") {
			throw new Error(`Expected idle loop, but loop is ${this.state}`)
		}
	}

	receiveInferenceResult(operationId: string, result: InferenceOutput, occurredAt: Date): void {
		if (this.state !== "awaiting_inference") {
			throw new Error(`Cannot receive inference result while loop is ${this.state}`)
		}

		const operation = this.pendingOperation

		if (operation?.type !== "inference" || operation.id !== operationId) {
			throw new Error(`Inference result does not match pending operation ${operationId}`)
		}

		this.inferenceInput.context.addContextItems(result.items)

		this.pendingOperation = undefined

		this.transitionTo("idle", "inference_completed", occurredAt, operationId)
	}

	receiveToolOutput(operationId: string, output: FunctionCallOutputItem, occurredAt: Date): void {
		if (this.state !== "awaiting_tool_output") {
			throw new Error(`Cannot receive tool output while loop is ${this.state}`)
		}

		const operation = this.pendingOperation

		if (operation?.type !== "tool_execution" || operation.id !== operationId) {
			throw new Error(`Tool output does not match pending operation ${operationId}`)
		}

		this.inferenceInput.context.addContextItem(output)

		this.pendingOperation = undefined

		this.transitionTo("idle", "tool_execution_completed", occurredAt, operationId)
	}

	static create(id: string, input: InferenceInput): AgentLoop {
		return new AgentLoop(id, "idle", input, undefined, [])
	}

	static rehydrate(snapshot: AgentLoopSnapshot): AgentLoop {
		return new AgentLoop(snapshot.id, snapshot.state, snapshot.inferenceInput, snapshot.pendingOperation, [
			...snapshot.executionHistory,
		])
	}

	snapshot(): AgentLoopSnapshot {
		return {
			id: this.id,
			state: this.state,
			inferenceInput: this.inferenceInput,
			pendingOperation: this.pendingOperation,
			executionHistory: [...this.executionHistory],
		}
	}
}
