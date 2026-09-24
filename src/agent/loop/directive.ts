import { ToolUseRequest } from "@agent/inference/context"
import { InferenceRequest } from "@agent/inference/inference-runner"

export type LoopControlDirective =
	| { type: "request_inference"; request: InferenceRequest }
	| { type: "request_tool_use"; call: ToolUseRequest }
	| { type: "wait" }
	| { type: "complete"; reason: string }
