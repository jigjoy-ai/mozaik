import { Peer } from "@peer/peer"
import { ConnectionRegistry } from "../connection-registry"
import { Envelope } from "@peer/envelope"

export class ReactToMessageUseCase {
	constructor(private readonly connectionRegistry: ConnectionRegistry) {}

	async execute(peer: Peer, networkId: string, envelope: Envelope<any>): Promise<void> {}
}
