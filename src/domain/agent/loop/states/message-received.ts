import { InferenceInput } from "@domain/generative-model/inference-runner"
import { UserMessageItem } from "@domain/generative-model/context/items/user-message"
import { LoopState, LoopStateExecution, ReceivedMessage } from "@domain/agent/loop/loop-state"
import { LoopVisitor } from "@domain/agent/loop/loop-visitor"

export class MessageReceivedState implements LoopState<ReceivedMessage, LoopStateExecution<"message_received">> {
	readonly id = "message_received"

	async run(input: ReceivedMessage, loopVisitor: LoopVisitor): Promise<LoopStateExecution<"message_received">> {
		loopVisitor.visitMessageReceivedStarted(input)

		const userMessage = UserMessageItem.create(input.content)

		const output: InferenceInput = {
			...input.input,
			context: input.input.context.addContextItems([userMessage]),
		}

		loopVisitor.visitMessageReceivedCompleted(output)
		return {
			stateId: this.id,
			input,
			output,
		}
	}
}
