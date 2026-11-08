import { Network } from "@domain/network"
import { NetworkRepository } from "@domain/network-repository"

export class CreateNetworkUseCase {
	private readonly networkRepository: NetworkRepository

	constructor(networkRepository: NetworkRepository) {
		this.networkRepository = networkRepository
	}

	async execute(name: string, ownerId: string): Promise<Network> {
		const network = Network.create(name, ownerId)

		await this.networkRepository.save(network)
		return network
	}
}
