import { Operation } from "@peer/operation"
import { ToolUseResult } from "@inference/context"
import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { Directive } from "@peer/directive"

export class FunctionCall implements Operation {
	id: string = "function_call"

	constructor(private readonly loopRepository: LoopRepository) {}

	async invoke(input: { loopId: string; operationId: string; result: ToolUseResult }): Promise<Loop> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		// const directive: Directive = {
		// 	id: input.operationId,
		// 	requestedAt: new Date(),
		// 	call: input.result,
		// 	output: input.result,
		// }
		// loop.issueDirective(input, input.operationId)

		return loop
	}
}
