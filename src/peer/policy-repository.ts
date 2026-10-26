import { Policy } from "@peer/policy"

export interface PolicyRepository {
	findById(id: string): Promise<Policy | undefined>
	save(policy: Policy): Promise<void>
}
