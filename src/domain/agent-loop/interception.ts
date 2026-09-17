import { ExecutableTransition, LoopTransition } from "./loop-state"

export interface InterceptionHandler {
	isSatisfiedBy(transition: ExecutableTransition): boolean
	handle(transition: ExecutableTransition): Promise<ExecutableTransition>
}

export type InterceptionOutput =
	| {
			type: "continue"
			transition: LoopTransition
	  }
	| {
			type: "pause"
			pendingTransition: LoopTransition
	  }
	| {
			type: "stop"
			reason?: string
	  }

export interface InterceptionParams {
	pendingTransition: LoopTransition
}
