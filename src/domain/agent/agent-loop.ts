import { ToolUseRequest } from "@domain/generative-model/context/items/tool-use-request"
import { ToolUseResult } from "@domain/generative-model/context/items/tool-use-result"
import { InferenceRequest, InferenceResult } from "@domain/generative-model/inference-runner"
import {
	LoopStateId,
	PendingOperation,
	AgentLoopTransition,
	PendingInference,
	PendingToolExecution,
	AgentLoopRecord,
} from "./types"

export class AgentLoop {
	private readonly loopId: string
	private state: LoopStateId
	private pendingOperation: PendingOperation | undefined
	private readonly transitionHistory: AgentLoopTransition[]
	private readonly inferenceRequest: InferenceRequest

	private constructor(
		loopId: string,
		state: LoopStateId,
		inferenceRequest: InferenceRequest,
		pendingOperation: PendingOperation | undefined,
		transitionHistory: AgentLoopTransition[],
	) {
		this.loopId = loopId
		this.state = state
		this.inferenceRequest = inferenceRequest
		this.pendingOperation = pendingOperation
		this.transitionHistory = transitionHistory
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

	get history(): readonly AgentLoopTransition[] {
		return this.transitionHistory
	}

	record(): AgentLoopRecord {
		return {
			id: this.id,
			state: this.state,
			inferenceRequest: this.inferenceRequest,
			pendingOperation: this.pendingOperation,
			transitionHistory: [...this.transitionHistory],
		}
	}

	moveToIdle(reason: string, occurredAt: Date): void {
		this.transitionTo("idle", reason, occurredAt)
		this.pendingOperation = undefined
	}

	moveToAwaitingInference(operation: PendingInference, occurredAt: Date): void {
		this.assertIdle()
		this.pendingOperation = operation

		this.transitionTo("awaiting_inference", "inference_requested", occurredAt, operation.id)
	}

	moveToAwaitingToolOutput(operation: Extract<PendingOperation, { type: "tool_execution" }>, occurredAt: Date): void {
		this.assertIdle()
		this.pendingOperation = operation

		this.transitionTo("awaiting_tool_output", "tool_execution_requested", occurredAt, operation.id)
	}

	requestInference(operationId: string, requestedAt: Date): PendingInference {
		this.assertIdle()

		const operation: PendingInference = {
			id: operationId,
			type: "inference",
			requestedAt,
			request: this.inferenceRequest,
		}

		this.moveToAwaitingInference(operation, requestedAt)

		return operation
	}

	requestToolUse(operationId: string, call: ToolUseRequest, requestedAt: Date): PendingToolExecution {
		this.assertIdle()

		const operation: PendingToolExecution = {
			id: operationId,
			type: "tool_execution",
			requestedAt,
			call,
		}

		this.moveToAwaitingToolOutput(operation, requestedAt)

		return operation
	}

	private transitionTo(nextState: LoopStateId, reason: string, occurredAt: Date, operationId?: string): void {
		const previousState = this.state
		this.state = nextState

		this.transitionHistory.push({
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

	receiveInferenceResult(operationId: string, result: InferenceResult, occurredAt: Date): void {
		if (this.state !== "awaiting_inference") {
			throw new Error(`Cannot receive inference result while loop is ${this.state}`)
		}

		const operation = this.pendingOperation

		if (operation?.type !== "inference" || operation.id !== operationId) {
			throw new Error(`Inference result does not match pending operation ${operationId}`)
		}

		this.inferenceRequest.context.addContextItems(result.items)

		this.pendingOperation = undefined

		this.transitionTo("idle", "inference_completed", occurredAt, operationId)
	}

	receiveToolUseResult(operationId: string, result: ToolUseResult, occurredAt: Date): void {
		if (this.state !== "awaiting_tool_output") {
			throw new Error(`Cannot receive tool output while loop is ${this.state}`)
		}

		const operation = this.pendingOperation

		if (operation?.type !== "tool_execution" || operation.id !== operationId) {
			throw new Error(`Tool output does not match pending operation ${operationId}`)
		}

		this.inferenceRequest.context.addContextItem(result)

		this.pendingOperation = undefined

		this.transitionTo("idle", "tool_execution_completed", occurredAt, operationId)
	}

	static create(id: string, input: InferenceRequest): AgentLoop {
		return new AgentLoop(id, "idle", input, undefined, [])
	}

	static rehydrate(snapshot: AgentLoopRecord): AgentLoop {
		return new AgentLoop(snapshot.id, snapshot.state, snapshot.inferenceRequest, snapshot.pendingOperation, [
			...snapshot.transitionHistory,
		])
	}
}
