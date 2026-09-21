import { ToolUseRequest } from "src/runtime/domain/generative-model/context/items/tool-use-request"
import { InferenceRequest } from "src/runtime/domain/generative-model/inference-runner"
import { Tool } from "src/runtime/domain/generative-model/tool"
import { ParticipantManifest } from "src/runtime/domain/runtime/participant"
import { Memory } from "./memory"
import { SituationHandler } from "src/runtime/domain/runtime/situation-handler"

export type LoopStateId = "idle" | "awaiting_inference" | "awaiting_tool_output" | "stopped" | "completed"

export type PendingInference = {
	id: string
	type: "inference"
	requestedAt: Date
	request: InferenceRequest
}

export type PendingToolExecution = {
	id: string
	type: "tool_execution"
	requestedAt: Date
	call: ToolUseRequest
}

export type PendingOperation = PendingInference | PendingToolExecution

export interface AgentLoopTransition {
	readonly id: string
	readonly occurredAt: Date
	readonly previousState: LoopStateId
	readonly nextState: LoopStateId
	readonly reason: string
	readonly operationId?: string
}

export interface AgentLoopRecord {
	id: string
	state: LoopStateId
	inferenceRequest: InferenceRequest
	pendingOperation?: PendingOperation
	transitionHistory: AgentLoopTransition[]
}

export type AgentRecord = {
	id: string
	manifest: ParticipantManifest
	tools: Tool[]
	memory: Memory
	handlers: SituationHandler[]
}
