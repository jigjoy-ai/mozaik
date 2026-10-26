import { Policy } from "@peer/policy"
import { PolicyRepository } from "@peer/policy-repository"

export class InMemoryPolicyRepository implements PolicyRepository {
	private readonly policies: Map<string, Policy> = new Map()

	async findById(id: string): Promise<Policy | undefined> {
		return this.policies.get(id)
	}

	async save(policy: Policy): Promise<void> {
		this.policies.set(policy.getId(), policy)
	}
}
