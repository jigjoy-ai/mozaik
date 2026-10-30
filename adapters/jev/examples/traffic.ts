import { z } from "zod"
import { MockJevAdapter } from "../src/index.js"
const stateSchema = z.object({ allRed: z.boolean() })
const proposalSchema = z.object({ green: z.enum(["north-south", "east-west"]) })
const provider = new MockJevAdapter({ stateSchema, proposalSchema, fixture: "agent-a" })
const request = {
	requestId: "traffic-1",
	sessionId: "junction",
	cycleId: "1",
	generation: 0,
	stateVersion: 1,
	state: { allRed: true },
	candidates: [
		{ id: "ns", producerId: "A", label: "Serve North/South", proposal: { green: "north-south" as const } },
		{ id: "ew", producerId: "B", label: "Serve East/West", proposal: { green: "east-west" as const } },
	],
}
const result = await provider.arbitrate(request)
// Application-owned safety gate. This example recommends; it does not control hardware.
const currentStateVersion = 1
const selected =
	result.status === "selected" ? request.candidates.find((c) => c.id === result.selectedCandidateId) : undefined
const accepted = Boolean(
	selected &&
	request.state.allRed &&
	result.stateVersion === currentStateVersion &&
	result.generation === request.generation,
)
console.log({ result, accepted, recommendation: accepted ? selected?.proposal : null })
