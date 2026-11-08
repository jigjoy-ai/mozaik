import { Network } from "@domain/network"
import { NetworkRepository } from "@domain/network-repository"

export class InMemoryNetworkRepository implements NetworkRepository {
	private readonly networks = new Map<string, Network>()

	async save(network: Network): Promise<void> {
		this.networks.set(network.getId(), network)
	}

	async findById(id: string): Promise<Network | undefined> {
		return this.networks.get(id)
	}

	async delete(id: string): Promise<void> {
		this.networks.delete(id)
	}
}
