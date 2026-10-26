import { Envelope } from "@peer/envelope"
import { EnvelopeSpecification } from "@peer/envelope-specification"
import { Rulebook } from "@peer/rulebook"
import { PeerDirectiveNetwork } from "@util/pdn"
import { EnvelopeSpecificationRegistry } from "@peer/envelope-specification-registry"
import "dotenv/config"
import { operationRegistry } from "./operation-registry"
import { specificationRegistry } from "./specification-registry"

const rulebook = Rulebook.create([
	{
		specificationId: "message.sent",
		operationId: "inference",
	},
])

async function main() {
	const pdn = new PeerDirectiveNetwork(operationRegistry, specificationRegistry)
	const network = await pdn.createNetwork({ name: "my-network" })

	console.log(`Network created: ${network.id}`)

	const mijura = await pdn.createPeer({
		name: "mijura",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
		rulebook: Rulebook.create([]),
	})

	const lotus = await pdn.createPeer({
		name: "lotus",
		capabilities: ["message"],
		role: "agent",
		networkId: network.id,
		rulebook,
	})

	await mijura.join(network.id)
	await lotus.join(network.id)
	mijura.sendMessage(network.id, "Tell me more about Domain-driven design")
}

main()
