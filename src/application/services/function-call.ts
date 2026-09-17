import { FunctionCallRunner } from "@domain/agentic-environment/loop/function-call"
import { Tool } from "@domain/generative-model/tool"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"

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
