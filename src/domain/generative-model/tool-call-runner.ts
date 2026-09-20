import { FunctionCallItem } from "./context/items/function-call"
import { FunctionCallOutputItem } from "./context/items/function-call-output"
import { Tool } from "./tool"

export interface FunctionCallRunner {
	run(call: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem>
}
