import { LoopControlDirective } from "@agent/loop/directive"
import { Loop } from "."
import { LoopSpecification } from "./specification"

export type LoopRule = {
	readonly when: LoopSpecification
	readonly then: (loop: Loop) => LoopControlDirective
}
