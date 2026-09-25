import { Agent } from "@agent/agent"
import { Loop } from "@agent/loop"
import { LoopController } from "@agent/loop/controller"
import { LoopSpecification } from "@agent/loop/specification"
import { Memory } from "@agent/memory"
import { ParticipantManifest } from "@environment/participant"
import { Tool } from "@inference/tool"

class Idle extends LoopSpecification {
	isSatisfiedBy(loop: Loop) {
		return loop.stateId === "idle"
	}
}

const manifest: ParticipantManifest = {
	name: "Summarize this article",
	capabilities: [],
	id: "",
	role: "agent",
}

const tools: Tool[] = []

const memory = Memory.create()
const loop = Loop.create("1", "Summarize this article", new Date())
const agent = new Agent(
	manifest,
	tools,
	memory,
	[],
	new Map<string, LoopController>([
		[
			loop.id,
			new LoopController(loop, [
				{
					when: new Idle(),
					then: () => ({ type: "wait" }),
				},
			]),
		],
	]),
)
const next = await agent.advanceLoop(loop.id)
console.log(next)
