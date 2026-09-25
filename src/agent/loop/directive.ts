import { ToolUseRequest } from "@inference/context"
import { InferenceRequest } from "@inference/inference-runner"

export type LoopControlDirective = InferenceDirective | ToolUseDirective | WaitDirective | CompleteDirective

export type InferenceDirective = { type: "inference"; request: InferenceRequest }
export type ToolUseDirective = { type: "tool_use"; call: ToolUseRequest }
export type WaitDirective = { type: "wait" }
export type CompleteDirective = { type: "complete"; reason: string }
