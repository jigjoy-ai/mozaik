import { ToolUseRequest } from "./context/items/tool-use-request"
import { ToolUseResult } from "./context/items/tool-use-result"
import { Tool } from "./tool"

export interface ToolUseRunner {
	run(request: ToolUseRequest, tool: Tool): Promise<ToolUseResult>
}
