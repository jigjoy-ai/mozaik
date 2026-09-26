import "dotenv/config"
import type { InferenceRequest } from "@inference/inference-runner"
import { inference, complete, state, createLoop, advanceLoop, createAgent } from "./module"

const request: InferenceRequest = {
	model: "gpt-5.4",
	context: {
		items: [
			{
				type: "user_message",
				text: "Tell me a joke about soccer.",
			},
		],
	},
}

async function run() {
	const agent = await createAgent({
		name: "joke-teller",
		instruction: "You are a joke teller. You are given a topic and you need to tell a joke about it.",
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
				when: state("completed"),
				then: complete("The joke was told."),
			},
		],
	})

	await advanceLoop(loop)
	console.log("loop state:", loop.stateId)
	console.log("completed operations:", loop.completedOperations.length)
}

run()
