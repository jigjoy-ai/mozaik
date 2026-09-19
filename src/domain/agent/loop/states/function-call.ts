import { FunctionCallOutputItem } from "@domain/generative-model/context/items/function-call-output"
import type { LoopState, LoopStateExecution } from "@domain/agent/loop/loop-state"
import type { Tool } from "@domain/generative-model/tool"
import type { LoopVisitor } from "@domain/agent/loop/loop-visitor"
import { InferenceInput } from "@domain/generative-model/inference-runner"
import { FunctionCallItem } from "@domain/generative-model/context/items/function-call"

export interface FunctionCallParams {
	call: FunctionCallItem
	inferenceInput: InferenceInput
}

export interface FunctionCallRunner {
	run(call: FunctionCallItem, tool: Tool): Promise<FunctionCallOutputItem>
}

export class FunctionCallState implements LoopState<FunctionCallParams, LoopStateExecution<"function_call">> {
	readonly id = "function_call"

	constructor(private readonly functionCallRunner: FunctionCallRunner) {}

	async run(input: FunctionCallParams, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"function_call">> {
		loopVisitor.visitFunctionCallStarted(input)

		const { call, inferenceInput } = input

		const tool: Tool | undefined = inferenceInput.tools?.find((tool) => tool.name === call.name)

		if (!tool) {
			const item = FunctionCallOutputItem.create(call.callId, `Error: unknown tool "${call.name}"`)
			loopVisitor.visitFunctionCallCompleted(item)
			return {
				stateId: this.id,
				input,
				output: { item },
			}
		}

		const item = await this.functionCallRunner.run(call, tool)

		loopVisitor.visitFunctionCallCompleted(item)
		return {
			stateId: this.id,
			input,
			output: {
				item,
			},
		}
	}
}
