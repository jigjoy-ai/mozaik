import { ToolUseResult } from "@agent/domain/inference/context"
import { ToolUseRequest } from "@agent/domain/inference/context"
import { ToolUseRunner } from "@agent/domain/inference/tool-use-runner"
import { Tool } from "@agent/domain/inference/tool"
import { ToolUseItemFactory } from "@agent/domain/inference/tool-use-item-factory"

export class LocalToolRunner implements ToolUseRunner {
	private readonly toolUseItemFactory = new ToolUseItemFactory()
	async run(input: ToolUseRequest, tool: Tool): Promise<ToolUseResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.toolArguments))

			const resultText = typeof result === "string" ? result : JSON.stringify(result)
			const toolUseResult = this.toolUseItemFactory.create(input, resultText)
			return toolUseResult
		} catch (error) {
			const errorText = `Error calling tool: ${error}`
			const toolUseResult = this.toolUseItemFactory.create(input, errorText)
			return toolUseResult
		}
	}
}
