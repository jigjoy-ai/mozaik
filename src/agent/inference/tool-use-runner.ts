import { ToolUseRequest, ToolUseResult } from "@agent/inference/context"
import { Tool } from "@agent/inference/tool"

export interface ToolUseRunner {
	run(request: ToolUseRequest, tool: Tool): Promise<ToolUseResult>
}
