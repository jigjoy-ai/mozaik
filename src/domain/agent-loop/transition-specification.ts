import { LoopStateExecution } from "./loop-state"

export interface TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean
}

export class AndSpecification implements TransitionSpecification {
	constructor(
		private readonly left: TransitionSpecification,
		private readonly right: TransitionSpecification,
	) {}

	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return this.left.isSatisfiedBy(execution) && this.right.isSatisfiedBy(execution)
	}
}

export class OrSpecification implements TransitionSpecification {
	constructor(
		private readonly left: TransitionSpecification,
		private readonly right: TransitionSpecification,
	) {}

	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return this.left.isSatisfiedBy(execution) || this.right.isSatisfiedBy(execution)
	}
}

export class NotSpecification implements TransitionSpecification {
	constructor(private readonly specification: TransitionSpecification) {}

	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return !this.specification.isSatisfiedBy(execution)
	}
}

// ============================================================
// Concrete transition specifications
// ============================================================

export class MessageReceivedSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return execution.stateId === "message_received"
	}
}

type InferenceExecution = Extract<LoopStateExecution, { stateId: "inference" | "inference_streaming" }>

/** Buffered and streaming inference produce the same output, so both satisfy the inference specifications. */
function isInferenceExecution(execution: LoopStateExecution): execution is InferenceExecution {
	return execution.stateId === "inference" || execution.stateId === "inference_streaming"
}

export class InferenceProducedFunctionCallSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return isInferenceExecution(execution) && execution.output.items.some((item) => item.type === "function_call")
	}
}

export class InferenceProducedModelMessageSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return (
			isInferenceExecution(execution) &&
			execution.output.items.some((item) => item.type === "message" && item.role === "assistant")
		)
	}
}

export class FunctionCallCompletedSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return execution.stateId === "function_call"
	}
}

export class ModelMessageCompletedSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return execution.stateId === "model_message"
	}
}

export class StreamingInferenceSpecification implements TransitionSpecification {
	isSatisfiedBy(execution: LoopStateExecution): boolean {
		return execution.stateId === "inference" && execution.input.streaming === true
	}
}
