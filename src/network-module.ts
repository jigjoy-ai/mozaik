import { ConnectPeerUseCase } from "@application/connect-peer"
import { DisconnectPeerUseCase } from "@application/disconnect-peer"
import { CreatePeerUseCase } from "@application/create-peer"
import { InMemoryNetworkRepository } from "@infrastructure/in-memory-network-repository"
import { CreateNetworkUseCase } from "@application/create-network"
import { PeerRole } from "@domain/peer-role"
import { SendEnvelopeUseCase } from "@application/send-envelope"
import { EnvelopeDistribution } from "@application/services/envelope-distribution"
import { NetworkRepository } from "@domain/network-repository"
import { WebSocketEnvelopeDelivery } from "@infrastructure/web-socket-envelope-delivery"
import { PeerRepository } from "@domain/peer-repository"
import { EnvelopeRepository } from "@domain/envelope-repositories"
import { InMemoryEnvelopeRepository } from "@infrastructure/in-memory-envelope-repository"
import { InMemoryPeerRepository } from "@infrastructure/in-memory-peer-repository"
import { PeerJoined, PeerLeft } from "@domain/built-in-envelopers"
import { Accounts } from "@domain/accounts"
import { Metering } from "@domain/metering"
import { Peer } from "@domain/peer"
import { OpenAccounts, Unmetered } from "@infrastructure/open-access"

type NetworkModule = {
	networkRepository: NetworkRepository
	peerRepository: PeerRepository
	envelopeRepository: EnvelopeRepository
	envelopeDelivery: WebSocketEnvelopeDelivery
	accounts: Accounts
	metering: Metering
}

type NetworkModuleConfig = Partial<NetworkModule>

let module: NetworkModule | undefined

function initNetworkModule(config: NetworkModuleConfig = {}) {
	if (module) {
		throw new Error("Network module already initialized")
	}

	module = {
		networkRepository: config.networkRepository ?? new InMemoryNetworkRepository(),
		peerRepository: config.peerRepository ?? new InMemoryPeerRepository(),
		envelopeRepository: config.envelopeRepository ?? new InMemoryEnvelopeRepository(),
		envelopeDelivery: config.envelopeDelivery ?? new WebSocketEnvelopeDelivery(),
		// Self-hosted by default: no keys, nothing counted.
		accounts: config.accounts ?? new OpenAccounts(),
		metering: config.metering ?? new Unmetered(),
	}
}

export function resolveNetworkModule(): NetworkModule {
	if (!module) {
		throw new Error("Network module is not initialized")
	}

	return module
}

const accountFor = async (apiKey: string | undefined): Promise<string | undefined> => {
	return await resolveNetworkModule().accounts.accountFor(apiKey)
}

const createNetwork = async (name: string, ownerId: string) => {
	const { networkRepository } = resolveNetworkModule()
	const createNetworkUseCase = new CreateNetworkUseCase(networkRepository)
	return await createNetworkUseCase.execute(name, ownerId)
}

const createPeer = async (name: string, role: PeerRole, capabilities: readonly string[], ownerId: string) => {
	const { peerRepository } = resolveNetworkModule()
	const createPeerUseCase = new CreatePeerUseCase(peerRepository)
	return await createPeerUseCase.execute(name, role, capabilities, ownerId)
}

function createEnvelopeDistribution(): EnvelopeDistribution {
	const { envelopeDelivery } = resolveNetworkModule()
	return new EnvelopeDistribution(envelopeDelivery)
}

function createConnectPeerUseCase(): ConnectPeerUseCase {
	const { networkRepository, peerRepository } = resolveNetworkModule()
	return new ConnectPeerUseCase(networkRepository, peerRepository, createEnvelopeDistribution())
}

const identify = async (token: unknown): Promise<Peer> => {
	return await createConnectPeerUseCase().identify(token)
}

const connect = async (networkId: string, peer: Peer): Promise<PeerJoined> => {
	return await createConnectPeerUseCase().execute(networkId, peer)
}

const disconnect = async (networkId: string, peerId: string): Promise<PeerLeft> => {
	const { networkRepository } = resolveNetworkModule()
	const disconnectPeerUseCase = new DisconnectPeerUseCase(networkRepository, createEnvelopeDistribution())
	return await disconnectPeerUseCase.execute(networkId, peerId)
}

const send = async (networkId: string, senderId: string, message: string) => {
	const { networkRepository, metering } = resolveNetworkModule()
	const sendEnvelopeUseCase = new SendEnvelopeUseCase(networkRepository, createEnvelopeDistribution(), metering)
	return await sendEnvelopeUseCase.execute(networkId, senderId, message)
}

export { accountFor, createNetwork, createPeer, identify, connect, disconnect, send, initNetworkModule }
