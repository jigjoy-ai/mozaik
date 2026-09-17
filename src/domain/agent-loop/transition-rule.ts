import { ModelMessageItem } from "@domain/model-context/context-item/model-item/model-message"
import { LoopStateExecution, LoopTransition } from "./loop-state"
import {
	FunctionCallCompletedSpecification,
	InferenceProducedFunctionCallSpecification,
	InferenceProducedModelMessageSpecification,
	MessageReceivedSpecification,
	ModelMessageCompletedSpecification,
	TransitionSpecification,
} from "./transition-specification"

export interface LoopTransitionRule {
	readonly specification: TransitionSpecification

	createTransition(execution: LoopStateExecution): LoopTransition
}

export class ContextPreparationToInferenceRule implements LoopTransitionRule {
	readonly specification = new MessageReceivedSpecification()

	createTransition(execution: LoopStateExecution): LoopTransition<"inference" | "inference_streaming"> {
		if (execution.stateId !== "message_received") {
			throw new Error("Expected context_preparation execution")
		}

		const nextStateId = execution.output.streaming ? "inference_streaming" : "inference"

		return {
			nextStateId,
			input: execution.output,
		}
	}
}

export class InferenceToFunctionCallRule implements LoopTransitionRule {
	readonly specification = new InferenceProducedFunctionCallSpecification()

	createTransition(execution: LoopStateExecution): LoopTransition<"function_call"> {
		if (
			(execution.stateId !== "inference" && execution.stateId !== "inference_streaming") ||
			!execution.output.items.some((item) => item.type === "function_call")
		) {
			throw new Error("Expected inference function-call output")
		}

		const functionCallItem = execution.output.items.find((item) => item.type === "function_call")

		if (!functionCallItem) {
			throw new Error("Expected inference function-call output")
		}

		return {
			nextStateId: "function_call",
			input: {
				call: functionCallItem,
				inferenceInput: execution.input,
			},
		}
	}
}

export class InferenceToModelMessageRule implements LoopTransitionRule {
	readonly specification = new InferenceProducedModelMessageSpecification()

	createTransition(execution: LoopStateExecution): LoopTransition<"model_message"> {
		if (
			(execution.stateId !== "inference" && execution.stateId !== "inference_streaming") ||
			!execution.output.items.some((item) => item.type === "message" && item.role === "assistant")
		) {
			throw new Error("Expected inference model-message output")
		}
		const modelMessageItem = execution.output.items.find(
			(item) => item.type === "message" && item.role === "assistant",
		) as ModelMessageItem

		if (!modelMessageItem) {
			throw new Error("Expected inference model-message output")
		}
		execution.input.context.addContextItem(modelMessageItem)

		return {
			nextStateId: "model_message",
			input: {
				answer: modelMessageItem,
			},
		}
	}
}

export class FunctionCallToInferenceRule implements LoopTransitionRule {
	readonly specification = new FunctionCallCompletedSpecification()

	createTransition(execution: LoopStateExecution): LoopTransition<"inference" | "inference_streaming"> {
		if (execution.stateId !== "function_call") {
			throw new Error("Expected function_call execution")
		}

		const previousRequest = execution.input.inferenceInput

		previousRequest.context.addContextItems([execution.input.call, execution.output.item])

		return {
			nextStateId: previousRequest.streaming ? "inference_streaming" : "inference",
			input: {
				...previousRequest,
			},
		}
	}
}

export class ModelMessageToIdleRule implements LoopTransitionRule {
	readonly specification = new ModelMessageCompletedSpecification()

	createTransition(execution: LoopStateExecution): LoopTransition<"idle"> {
		if (execution.stateId !== "model_message") {
			throw new Error("Expected model_message execution")
		}

		return {
			nextStateId: "idle",
			input: undefined,
		}
	}
}
