import { RuntimeService } from "@app/services/runtime"
import { DomainModel } from "@domain/runtime/runtime-state"
import { RuntimeEvent } from "@domain/runtime/event"

export function createSendEvent<TModel extends DomainModel>(resolveRuntime: () => RuntimeService<TModel>) {
	return function sendEvent(event: RuntimeEvent, senderId: string): void {
		const runtime = resolveRuntime()
		const participant = runtime.getParticipant(senderId)
		if (!participant) {
			throw new Error(`Participant ${senderId} not found`)
		}

		runtime.publish(event)
	}
}
