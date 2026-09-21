import { ToolUseRequest, ToolUseResult } from "./context"
import { Tool } from "./tool"

export interface ToolUseRunner {
	run(request: ToolUseRequest, tool: Tool): Promise<ToolUseResult>
}
