import { LoopSpecification } from "@agent/loop/specification"
import { LoopAction } from "@agent/loop/action"

export type LoopRule = {
	readonly when: LoopSpecification
	readonly then: LoopAction
}
