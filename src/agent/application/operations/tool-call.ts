import { Directive } from "@peer/directive"
import { ToolCallRequest, ToolCallResult } from "@inference/context"
import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolCallRunner } from "@inference/tool-call-runner"
import { Tool } from "@inference/tool"
import { DirectiveResult } from "@peer/directive-result"

export class ToolCall implements Directive {
	id: string = "tool-call"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly toolCallRunner: ToolCallRunner,
	) {}

	async invoke(input: {
		loopId: string
		directiveId: string
		request: ToolCallRequest
		tool: Tool
	}): Promise<DirectiveResult<ToolCallResult>> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const result: ToolCallResult = await this.toolCallRunner.run(input.request, input.tool)

		const directiveResult: DirectiveResult<ToolCallResult> = {
			directiveId: input.directiveId,
			result: result,
		}
		loop.acceptResult(directiveResult)

		return directiveResult
	}
}
