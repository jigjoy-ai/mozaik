import { ToolUseRequest, ToolUseResult } from "@inference/context"
import { InferenceRequest, InferenceResult } from "@inference/inference-runner"

export type CompletedOperation =
	| {
			type: "inference"
			operationId: string
			requestedAt: Date
			completedAt: Date
			request: InferenceRequest
			result: InferenceResult
	  }
	| {
			type: "tool_use"
			operationId: string
			requestedAt: Date
			completedAt: Date
			call: ToolUseRequest
			result: ToolUseResult
	  }

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
