import { MozaikClient } from "@util/mozaik-network"

async function main() {
	const client = new MozaikClient()

	const network = await client.createNetwork({ name: "my-network" })
	console.log(`Network created: ${network.id}`)

	const participant = await client.createParticipant({
		name: "my-participant",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
	})

	const participant2 = await client.createParticipant({
		name: "my-participant-2",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
	})

	const session = client.session(participant)
	const session2 = client.session(participant2)

	await session.join(network.id)
	await session2.join(network.id)
	session.sendMessage(network.id, "Hello, world!")

	session.leave(network.id)
	session2.sendMessage(network.id, "Still here after the other left")
}

main()
