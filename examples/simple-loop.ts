import "dotenv/config"
import { Memory } from "@agent/memory"
import type { UserMessageItem } from "@inference/context"
import type { InferenceRequest } from "@inference/inference-runner"
import { inference, complete, state, createLoop, advanceLoop, createAgent } from "./module"

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
		rules: [
			{
				when: state("idle"),
				then: inference(request),
			},
			{
				when: state("awaiting_tool_output"),
				then: complete("The joke was told."),
			},
		],
	})

	await advanceLoop(loop)
	console.log("loop state:", loop.stateId)
	console.log("completed operations:", loop.completedOperations.length)
}

run()
