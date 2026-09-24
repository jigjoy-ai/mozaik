import { Memory } from "@agent/memory"
import { Participant, ParticipantManifest } from "@environment/domain/participant"
import { Tool } from "@agent/inference/tool"
import { SituationHandler } from "@environment/domain/situation-handler"
import { AgentRecord } from "@agent/record"
import { LoopControlDirective } from "@agent/loop/directive"
import { LoopController } from "@agent/loop/controller"
import { LoopRule } from "@agent/loop/rule"

export class Agent extends Participant {
	private memory: Memory
	private tools: Tool[]
	private loopControllers: Map<string, LoopController>

	constructor(
		manifest: ParticipantManifest,
		tools: Tool[],
		memory: Memory,
		handlers: SituationHandler[],
		loopControllers: Map<string, LoopController>,
	) {
		super(manifest, handlers)
		this.memory = memory
		this.tools = tools
		this.loopControllers = loopControllers
	}

	getTools(): Tool[] {
		return this.tools
	}

	getMemory(): Memory {
		return this.memory
	}

	addRuleToLoop(loopId: string, rule: LoopRule): void {
		const controller = this.loopControllers.get(loopId)
		if (!controller) {
			throw new Error(`Loop with id ${loopId} not found`)
		}
		controller.addRule(rule)
	}

	removeRuleFromLoop(loopId: string, rule: LoopRule): void {
		const controller = this.loopControllers.get(loopId)
		if (!controller) {
			throw new Error(`Loop with id ${loopId} not found`)
		}
		controller.removeRule(rule)
	}

	decideNextAction(loopId: string): LoopControlDirective | undefined {
		const controller = this.loopControllers.get(loopId)
		if (!controller) {
			throw new Error(`Loop with id ${loopId} not found`)
		}
		return controller.decide()
	}

	advanceLoop(loopId: string): LoopControlDirective | undefined {
		return this.decideNextAction(loopId)
	}

	static create({
		manifest,
		tools,
		memory,
		handlers,
	}: {
		manifest: ParticipantManifest
		tools: Tool[]
		memory: Memory
		handlers: SituationHandler[]
	}): Agent {
		const loopControllers = new Map<string, LoopController>()
		return new Agent(manifest, tools, memory, handlers, loopControllers)
	}

	static rehydrate(record: AgentRecord): Agent {
		const agent = new Agent(
			record.manifest,
			record.tools,
			record.memory,
			record.handlers,
			record.loopControllers ?? new Map<string, LoopController>(),
		)
		return agent
	}
}
