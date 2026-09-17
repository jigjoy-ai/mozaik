import { RuntimeService } from "@app/services/runtime"
import { DomainModel } from "@domain/agentic-environment/runtime-state"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export function createSendEvent<TModel extends DomainModel>(resolveRuntime: () => RuntimeService<TModel>) {
	return function sendEvent(event: SemanticEvent, senderId: string): void {
		const runtime = resolveRuntime()
		const participant = runtime.getParticipant(senderId)
		if (!participant) {
			throw new Error(`Participant ${senderId} not found`)
		}

		runtime.publish(event)
	}
}
