import { Tool } from "@domain/generative-model/tool"
import { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import { InferenceInput } from "./inference"

export interface FunctionCallRunner {
	run(call: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem>
}

export interface FunctionCallParams {
	call: FunctionCallItem
	inferenceInput: InferenceInput
}
