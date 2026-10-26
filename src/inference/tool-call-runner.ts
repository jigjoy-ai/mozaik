import { ToolCallRequest, ToolCallResult } from "@inference/context"
import { Tool } from "@inference/tool"

export interface ToolCallRunner {
	run(request: ToolCallRequest, tool: Tool): Promise<ToolCallResult>
}
