import { ToolCallRequest, ToolCallResult } from "@inference/context"

export class ToolCallResultFactory {
	static create(toolUseRequest: ToolCallRequest, result: string): ToolCallResult {
		const toolUseResult: ToolCallResult = {
			type: "tool_call_result",
			requestId: toolUseRequest.requestId,
			result: {
				type: "input_text",
				text: result,
			},
		}
		return toolUseResult
	}
}
