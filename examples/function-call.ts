import "dotenv/config"
import { initAgentModule } from "@agent/index"
import { Contract } from "@peer/contract"
import { Rulebook } from "@peer/rulebook"

initAgentModule()

const sendEmailContract: Contract = {
	id: "send-email-fc",
	type: "function",
	description: "Send an email",
	inputSchema: {
		type: "object",
		properties: {
			subject: { type: "string" },
			body: { type: "string" },
			to: { type: "string" },
		},
	},
}

const rulebook = Rulebook.create([
	{
		specificationId: "awaiting-request",
		operationId: "request-preparation",
	},
	{
		specificationId: "awaiting-inference",
		operationId: "inference",
	},
	{
		specificationId: "awaiting-tool-output",
		operationId: "tool-use",
	},
	{
		specificationId: "completed",
		operationId: "complete",
	},
])

async function main(): Promise<void> {}

main()
