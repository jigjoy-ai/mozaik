import { Policy } from "@peer/policy"
import { MozaikNetworkClient } from "@util/pdn"
import "dotenv/config"

const policy = Policy.create([
	{
		specification: "message.received",
		inputResolver: "standard.llm.request",
		directive: "inference",
	},
])

async function main() {
	const client = new MozaikNetworkClient()
	const network = await client.createNetwork({ name: "my-network" })

	console.log(`Network created: ${network.id}`)

	const mijura = await client.createPeer({
		name: "mijura",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
		policy: Policy.create([]),
	})

	const lotus = await client.createPeer({
		name: "lotus",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
		policy,
	})

	await mijura.join(network.id)
	await lotus.join(network.id)
	mijura.sendMessage(network.id, "Tell me more about Domain-driven design")
}

main()
