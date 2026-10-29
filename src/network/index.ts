import { JoinNetworkUseCase } from "./use-cases/join"
import { ConnectionRegistry } from "./connection-registry"
import { Peer } from "@peer/peer"
import { LeaveNetworkUseCase } from "./use-cases/leave"
import { SendMessageUseCase } from "./use-cases/send-message"
import { ReactToMessageUseCase } from "./use-cases/react"
import { Envelope } from "@peer/envelope"

const connectionRegistry = new ConnectionRegistry()

export async function join(peer: Peer, networkId: string): Promise<void> {
	const useCase = new JoinNetworkUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId)
}

export async function leave(peer: Peer, networkId: string): Promise<void> {
	const useCase = new LeaveNetworkUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId)
}

export function sendMessage(peer: Peer, networkId: string, message: string): Promise<void> {
	const useCase = new SendMessageUseCase(connectionRegistry)
	return useCase.execute(peer, networkId, message)
}

export async function reactToMessage(peer: Peer, networkId: string, envelope: Envelope<any>): Promise<void> {
	const useCase = new ReactToMessageUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId, envelope)
}
