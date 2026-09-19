import { RuntimeService } from "@app/services/runtime"
import { DomainModel } from "@domain/environment/runtime-state"
import { MessageSentEvent } from "@domain/environment/event"

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
