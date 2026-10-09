import "dotenv/config"

import type { ContextItem } from "@inference/context"
import { Mem0Factory } from "@agent/infrastructure/memory/mem0-memory-factory"

async function main() {

	const participantId = `test-user-${Date.now()}`

	const factory = new Mem0Factory() 
	const memory = factory.create()

	const items: ContextItem[] = [
		{
			type: "user_message",
			text: "I am a traveler looking for flight information.",
		},
		{
			type: "model_message",
			text: "Where do you want to go?",
		},
		{
			type: "user_message",
			text: "I want to go to Los Angeles.",
		},
	]

    console.log("Participant:", participantId)

	await memory.remember(items, participantId)

	await new Promise((resolve) => setTimeout(resolve, 5000))

	console.log("\nMemories saved.")

	const recalledItems = await memory.recall(
		"Where does the user want to go?",
		participantId
	)

	await new Promise((resolve) => setTimeout(resolve, 5000))

	console.log("\nRecalled memories:")
	console.dir(recalledItems, { depth:null})
}

main().catch((error) => {
    console.error("Error:", error)
})