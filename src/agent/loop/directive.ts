import { ToolUseRequest } from "@inference/context"
import { InferenceRequest } from "@inference/inference-runner"

export type LoopControlDirective =
	| { type: "request_inference"; request: InferenceRequest }
	| { type: "request_tool_use"; call: ToolUseRequest }
	| { type: "wait" }
	| { type: "complete"; reason: string }
