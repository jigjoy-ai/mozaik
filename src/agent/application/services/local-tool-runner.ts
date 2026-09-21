import { ToolUseResult } from "src/generative-model/context/items/tool-use-result"
import { ToolUseRequest } from "src/generative-model/context/items/tool-use-request"
import { ToolUseRunner } from "src/generative-model/tool-use-runner"
import { Tool } from "src/generative-model/tool"

export class LocalToolRunner implements ToolUseRunner {
	async run(input: ToolUseRequest, tool: Tool): Promise<ToolUseResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.args))

			return ToolUseResult.create(input.callId, typeof result === "string" ? result : JSON.stringify(result))
		} catch (error) {
			return ToolUseResult.create(input.callId, `Error calling tool: ${error}`)
		}
	}
}
