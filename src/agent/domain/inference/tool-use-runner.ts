import { ToolUseRequest, ToolUseResult } from "@agent/domain/inference/context"
import { Tool } from "@agent/domain/inference/tool"

export interface ToolUseRunner {
	run(request: ToolUseRequest, tool: Tool): Promise<ToolUseResult>
}
