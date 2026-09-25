import { LoopStateId } from "@agent/loop"
import {
	AwaitingInference,
	AwaitingToolOutput,
	Completed,
	Idle,
	LoopSpecification,
	Stopped,
} from "@agent/loop/specification"

export class LoopStateUseCase {
	execute(loopStateId: LoopStateId): LoopSpecification {
		if (loopStateId === "idle") {
			return new Idle()
		}
		if (loopStateId === "awaiting_inference") {
			return new AwaitingInference()
		}
		if (loopStateId === "awaiting_tool_output") {
			return new AwaitingToolOutput()
		}
		if (loopStateId === "stopped") {
			return new Stopped()
		}
		if (loopStateId === "completed") {
			return new Completed()
		}
		throw new Error(`Invalid loop state: ${loopStateId}`)
	}
}
