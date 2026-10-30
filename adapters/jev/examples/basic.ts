import { z } from "zod"
import { MockJevAdapter } from "../src/index.js"
const provider = new MockJevAdapter({
	stateSchema: z.object({ priority: z.string() }),
	proposalSchema: z.object({ action: z.string() }),
	fixture: "agent-a",
})
console.log(
	await provider.arbitrate({
		requestId: "basic-1",
		sessionId: "demo",
		cycleId: "1",
		generation: 0,
		stateVersion: 1,
		state: { priority: "speed" },
		candidates: [
			{ id: "fast", producerId: "a", label: "Fast response", proposal: { action: "respond" } },
			{ id: "review", producerId: "b", label: "Detailed review", proposal: { action: "review" } },
		],
	}),
)
