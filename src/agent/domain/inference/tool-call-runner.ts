import type { ToolCallRequest } from "@agent/domain/inference/context"
import type { ToolCallResult } from "@agent/domain/inference/context"
import type { Tool } from "@agent/domain/inference/tool"

export interface ToolCallRunner {
	run(request: ToolCallRequest, tool: Tool): Promise<ToolCallResult>
}
