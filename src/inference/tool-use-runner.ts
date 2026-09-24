import { ToolUseRequest, ToolUseResult } from "@inference/context"
import { Tool } from "@inference/tool"

export interface ToolUseRunner {
	run(request: ToolUseRequest, tool: Tool): Promise<ToolUseResult>
}
