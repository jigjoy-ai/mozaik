import "dotenv/config"
import { LoopController } from "@agent/loop/controller"
import { Memory } from "@agent/memory"
import type { UserMessageItem } from "@inference/context"
import type { InferenceRequest } from "@inference/inference-runner"
import { advanceLoop, createAgent, createLoop, loopState } from "./module"

const memory = Memory.create()
const userMessage: UserMessageItem = {
	type: "user_message",
	content: { type: "input_text", text: "Tell me a joke about soccer." },
}

memory.getContext().items.push(userMessage)

const request: InferenceRequest = {
	model: "gpt-5.4",
	context: memory.getContext(),
}

async function run() {
	const agent = await createAgent({
		name: "joke-teller",
		instruction: "You are a joke teller. You are given a topic and you need to tell a joke about it.",
		capabilities: [],
		tools: [],
		handlers: [],
	})

	const loop = await createLoop({
		agentId: agent.id,
		subject: "Tell me a joke about the topic",
	})

	const controller = new LoopController(loop, [
		{
			when: loopState("idle"),
			then: (loop) => ({ type: "request_inference", request }),
		},
		{
			when: loopState("awaiting_inference"),
			then: (loop) => ({ type: "request_inference", request }),
		},
		{
			when: loopState("awaiting_tool_output"),
			then: (loop) => ({ type: "request_inference", request }),
		},
	])

	await advanceLoop(loop, controller)
	console.log("loop state:", loop.stateId)
	console.log("completed operations:", loop.completedOperations.length)
}

run()
