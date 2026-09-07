import { describe, expect, it } from "@rstest/core"
import { FunctionCallState } from "@app/states/function-call"
import { FunctionCallItem } from "@domain/model-context/context-item/model-item/function-call"
import type { FunctionCallOutputItem } from "@domain/model-context/context-item/client-item/function-call-output"
import type { LoopVisitor } from "@domain/agentic-environment/loop/loop-visitor"

describe("FunctionCallState", () => {
	it("completes the lifecycle when the model calls an unknown tool", async () => {
		const events: Array<[string, string]> = []
		const visitor = {
			visitFunctionCallStarted: ({ call }) => events.push(["started", call.callId]),
			visitFunctionCallCompleted: (output: FunctionCallOutputItem) => events.push(["completed", output.callId]),
		} as LoopVisitor
		const state = new FunctionCallState({
			run: async () => {
				throw new Error("runner must not be called")
			},
		})
		const call = FunctionCallItem.rehydrate({ callId: "call-1", name: "missing", args: "{}" })

		const result = await state.run(
			{ call, inferenceInput: { model: "test", context: {} as never, tools: [] } },
			visitor,
		)

		expect(events).toEqual([
			["started", "call-1"],
			["completed", "call-1"],
		])
		expect(result.output.item.output.text).toBe('Error: unknown tool "missing"')
	})
})
