import { InterceptionHandler } from "@domain/agent-loop/interception"
import { LoopTransition, ReceivedMessage } from "@domain/agent-loop/loop-state"
import { LoopVisitor } from "@domain/agent-loop/loop-visitor"
import { LoopStateExecutor } from "@domain/agent-loop/loop-state"
import { TransitionResolver } from "@domain/agent-loop/transition-resolver"

export class AgentLoop {
	private constructor(
		private readonly loopId: string,
		private readonly stateExecutor: LoopStateExecutor,
		private readonly transitionResolver: TransitionResolver,
		private readonly interceptionHandler?: InterceptionHandler,
	) {}

	async run(message: ReceivedMessage, loopVisitor: LoopVisitor): Promise<void> {
		let transition: LoopTransition = {
			nextStateId: "message_received",
			input: message,
		}

		while (transition.nextStateId !== "idle") {
			const isInterceptionSatisfied = this.interceptionHandler?.isSatisfiedBy(transition)

			if (isInterceptionSatisfied && this.interceptionHandler) {
				loopVisitor.visitInterceptionStarted(transition)
				transition = await this.interceptionHandler.handle(transition)
				loopVisitor.visitInterceptionFinished(transition)
			}

			const execution = await this.stateExecutor.execute(transition, loopVisitor)
			transition = this.transitionResolver.resolve(execution)
		}
	}

	getLoopId(): string {
		return this.loopId
	}

	static create(
		stateExecutor: LoopStateExecutor,
		transitionResolver: TransitionResolver,
		interceptionHandler?: InterceptionHandler,
	): AgentLoop {
		const loopId = crypto.randomUUID()
		return new AgentLoop(loopId, stateExecutor, transitionResolver, interceptionHandler)
	}
}
