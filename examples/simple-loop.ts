import "dotenv/config"
import { Loop } from "@agent/loop"
import { LoopController } from "@agent/loop/controller"
import { LoopSpecification } from "@agent/loop/specification"
import { Memory } from "@agent/memory"
import type { UserMessageItem } from "@inference/context"
import type { InferenceRequest } from "@inference/inference-runner"
import { advanceLoop, createAgent, createLoop } from "./module"

class Idle extends LoopSpecification {
	isSatisfiedBy(loop: Loop) {
		return loop.stateId === "idle"
	}
}

const memory = Memory.create()
const userMessage: UserMessageItem = {
	type: "user_message",
	content: { type: "input_text", text: "Summarize this article." },
}

memory.getContext().items.push(userMessage)

const request: InferenceRequest = {
	model: "gpt-5.4",
	context: memory.getContext(),
}

const agent = await createAgent({
	name: "summarizer",
	instruction: "Summarize this article.",
	capabilities: [],
	tools: [],
	handlers: [],
})

const loop = await createLoop({
	agentId: agent.id,
	subject: "Summarize this article",
})

const controller = new LoopController(loop, [
	{
		when: new Idle(),
		then: () => ({ type: "request_inference", request }),
	},
])

async function run() {
	await advanceLoop(loop, controller)
	console.log("loop state:", loop.stateId)
	console.log("completed operations:", loop.completedOperations.length)
}

run()
