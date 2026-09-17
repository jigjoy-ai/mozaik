import { RuntimeService } from "@app/services/runtime"
import { DomainModel } from "@domain/agentic-environment/runtime-state"
import { MessageSentEvent } from "@domain/agentic-environment/semantic-event/event"

export function createSendMessage<TModel extends DomainModel>(resolveRuntime: () => RuntimeService<TModel>) {
	return function sendMessage(message: string, senderId: string): void {
		const runtime = resolveRuntime()
		const participant = runtime.getParticipant(senderId)
		if (!participant) {
			throw new Error(`Participant ${senderId} not found`)
		}

		const userMessage: MessageSentEvent = MessageSentEvent.init(senderId, message)
		runtime.publish(userMessage)
	}
}
