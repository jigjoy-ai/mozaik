import { ToolUseRequest, ToolUseResult } from "./context"

export class ToolUseItemFactory {
	create(toolUseRequest: ToolUseRequest, result: string): ToolUseResult {
		const toolUseResult: ToolUseResult = {
			type: "tool_use_result",
			requestId: toolUseRequest.requestId,
			result: {
				type: "input_text",
				text: result,
			},
		}
		return toolUseResult
	}
}
