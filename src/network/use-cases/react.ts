import { Peer } from "@network/peer/peer"
import { ConnectionRegistry } from "../connection-registry"
import { Envelope } from "@network/peer/envelope"

export class ReactToMessageUseCase {
	constructor(private readonly connectionRegistry: ConnectionRegistry) {}

	async execute(peer: Peer, networkId: string, envelope: Envelope<any>): Promise<void> {}
}
