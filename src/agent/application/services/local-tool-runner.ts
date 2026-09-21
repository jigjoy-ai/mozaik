import { ToolUseResult } from "src/inference/context"
import { ToolUseRequest } from "src/inference/context"
import { ToolUseRunner } from "src/inference/tool-use-runner"
import { Tool } from "src/inference/tool"

export class LocalToolRunner implements ToolUseRunner {
	async run(input: ToolUseRequest, tool: Tool): Promise<ToolUseResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.toolArguments))

			const toolUseResult: ToolUseResult = {
				type: "tool_use_result",
				requestId: input.requestId,
				result: {
					type: "input_text",
					text: typeof result === "string" ? result : JSON.stringify(result),
				},
			}
			return toolUseResult
		} catch (error) {
			const toolUseResult: ToolUseResult = {
				type: "tool_use_result",
				requestId: input.requestId,
				result: {
					type: "input_text",
					text: `Error calling tool: ${error}`,
				},
			}
			return toolUseResult
		}
	}
}
