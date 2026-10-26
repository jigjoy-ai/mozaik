import { ToolCallRequest, ToolCallResult } from "@inference/context"
import { InferenceRequest } from "@inference/inference-request"
import { InferenceResult } from "@inference/inference-result"

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
			type: "tool-call"
			operationId: string
			requestedAt: Date
			completedAt: Date
			call: ToolCallRequest
			result: ToolCallResult
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
	call: ToolCallRequest
}

export type PendingOperation = PendingInference | PendingToolExecution
