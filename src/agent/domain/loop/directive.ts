import { ToolCallRequest } from "@inference/context"
import { InferenceRequest } from "@inference/inference-request"

export type LoopControlDirective = InferenceDirective | ToolCallDirective | PauseLoopDirective | CompleteDirective

export type InferenceDirective = { type: "inference"; request: InferenceRequest }
export type ToolCallDirective = { type: "tool_call"; request: ToolCallRequest }
export type PauseLoopDirective = { type: "pause_loop"; reason: string }
export type CompleteDirective = { type: "complete"; reason: string }
