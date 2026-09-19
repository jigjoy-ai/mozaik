import { FunctionCallRunner } from "@domain/agent/loop/states/function-call"
import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"
import { Tool } from "@domain/generative-model/tool"

export class DefaultFunctionCallRunner implements FunctionCallRunner {
	async run(input: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem> {
		try {
			const result = await tool.invoke(JSON.parse(input.args))

			return FunctionCallOutputItem.create(
				input.callId,
				typeof result === "string" ? result : JSON.stringify(result),
			)
		} catch (error) {
			return FunctionCallOutputItem.create(input.callId, `Error calling tool: ${error}`)
		}
	}
}
