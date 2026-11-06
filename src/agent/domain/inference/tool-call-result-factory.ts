import type { ToolCallRequest } from "@agent/domain/inference/context"
import type { ToolCallResult } from "@agent/domain/inference/context"

export class ToolCallResultFactory {
	static create(toolCallRequest: ToolCallRequest, result: string): ToolCallResult {
		const toolCallResult: ToolCallResult = {
			type: "tool_call_result",
			requestId: toolCallRequest.requestId,
			result: {
				type: "input_text",
				text: result,
			},
		}
		return toolCallResult
	}
}
