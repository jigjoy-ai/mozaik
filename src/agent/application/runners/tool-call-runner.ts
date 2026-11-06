import { ToolCallRequest, ToolCallResult } from "@agent/domain/inference/context"
import { ToolCallRunner } from "@agent/domain/inference/tool-call-runner"
import { Tool } from "@agent/domain/inference/tool"
import { ToolCallResultFactory } from "@agent/domain/inference/tool-call-result-factory"

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
