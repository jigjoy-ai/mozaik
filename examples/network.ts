import { NetworkClient } from "src/network/network-client"
import "dotenv/config"
import { join, sendMessage } from "src/network"

async function main() {
	const client = new NetworkClient()
	const network = await client.createNetwork({ name: "my-network" })

	console.log(`Network created: ${network.id}`)

	const mijura = await client.createPeer({
		name: "mijura",
		capabilities: ["message"],
		role: "user",
		networkId: network.id,
		policy: {
			rules: [],
		},
	})

	const lotus = await client.createPeer({
		name: "lotus",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
		policy: {
			rules: [
				{
					condition: "message.received",
					input: "standard.request",
					directive: "mozaik_agent.run_loop",
				},
				{
					condition: "tool_call.requested",
					input: "standard.request",
					directive: "tool_call",
				},
			],
		},
	})

	await join(mijura, network.id)
	await join(lotus, network.id)

	sendMessage(mijura, network.id, "Tell me more about Domain-driven design")
}

main()
