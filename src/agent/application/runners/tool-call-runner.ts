import { ToolCallRequest, ToolCallResult } from "@inference/context"
import { ToolCallRunner } from "@inference/tool-call-runner"
import { Tool } from "@inference/tool"
import { ToolCallResultFactory } from "@inference/tool-call-result-factory"

export class LocalToolRunner implements ToolCallRunner {
	async run(input: ToolCallRequest, tool: Tool): Promise<ToolCallResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.toolArguments))
			const resultText = typeof result === "string" ? result : JSON.stringify(result)
			return ToolCallResultFactory.create(input, resultText)
		} catch (error) {
			const errorText = `Error calling tool: ${error}`
			return ToolCallResultFactory.create(input, errorText)
		}
	}
}
