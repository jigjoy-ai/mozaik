import { PeerDirectiveNetwork } from "@util/pdn"

async function main() {
	const pdn = new PeerDirectiveNetwork()

	const network = await pdn.createNetwork({ name: "my-network" })
	console.log(`Network created: ${network.id}`)

	const mijura = await pdn.createPeer({
		name: "mijura",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
	})

	const lotus = await pdn.createPeer({
		name: "lotus",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
	})

	await mijura.join(network.id)
	await lotus.join(network.id)
	mijura.sendMessage(network.id, "Hello, Lotus!")
}

main()
