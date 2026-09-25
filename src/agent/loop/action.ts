import { Loop } from "@agent/loop"
import { LoopControlDirective } from "@agent/loop/directive"
import { ToolUseRequest } from "@inference/context"
import { InferenceRequest } from "@inference/inference-runner"

export abstract class LoopAction {
	abstract execute(loop: Loop): LoopControlDirective
}

export class InferenceAction extends LoopAction {
	private request: InferenceRequest

	constructor(request: InferenceRequest) {
		super()
		this.request = request
	}

	execute(): LoopControlDirective {
		return { type: "inference", request: this.request }
	}
}

export class ToolUseAction extends LoopAction {
	private call: ToolUseRequest

	constructor(call: ToolUseRequest) {
		super()
		this.call = call
	}

	execute(): LoopControlDirective {
		return { type: "tool_use", call: this.call }
	}
}

export class CompleteAction extends LoopAction {
	private reason: string

	constructor(reason: string) {
		super()
		this.reason = reason
	}

	execute(): LoopControlDirective {
		return { type: "complete", reason: this.reason }
	}
}

export class WaitAction extends LoopAction {
	execute(): LoopControlDirective {
		return { type: "wait" }
	}
}
