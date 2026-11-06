import { Directive } from "@network/peer/directive"
import { ToolCallRequest, ToolCallResult } from "@agent/domain/inference/context"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolCallRunner } from "@agent/domain/inference/tool-call-runner"
import { Tool } from "@agent/domain/inference/tool"
import { DirectiveResult } from "@network/peer/directive-result"

export class ToolCall implements Directive {
	id: string = "toolcall"

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
