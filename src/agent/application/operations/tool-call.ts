import { Operation } from "@peer/operation"
import { ToolCallRequest, ToolCallResult } from "@inference/context"
import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolCallRunner } from "@inference/tool-call-runner"
import { Tool } from "@inference/tool"
import { DirectiveResult } from "@peer/directive-result"

export class ToolCall implements Operation {
	id: string = "tool-call"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly toolCallRunner: ToolCallRunner,
	) {}

	async invoke(input: { loopId: string; operationId: string; request: ToolCallRequest; tool: Tool }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const result = await this.toolCallRunner.run(input.request, input.tool)

		const directiveResult: DirectiveResult = {
			directiveId: input.operationId,
			output: result,
		}
		loop.acceptResult(directiveResult)

		return loop
	}
}
