import { ToolUseResult } from "@domain/generative-model/context/items/tool-use-result"
import { ToolUseRequest } from "@domain/generative-model/context/items/tool-use-request"
import { ToolUseRunner } from "@domain/generative-model/tool-use-runner"
import { Tool } from "@domain/generative-model/tool"

export class LocalToolUseRunner implements ToolUseRunner {
	async run(input: ToolUseRequest, tool: Tool): Promise<ToolUseResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.args))

			return ToolUseResult.create(input.callId, typeof result === "string" ? result : JSON.stringify(result))
		} catch (error) {
			return ToolUseResult.create(input.callId, `Error calling tool: ${error}`)
		}
	}
}
