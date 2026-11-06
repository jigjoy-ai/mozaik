import { BehaviorPolicy } from "@network/peer/behavior-policy"

export interface BehaviorPolicyRepository {
	findById(id: string): Promise<BehaviorPolicy | undefined>
	save(policy: BehaviorPolicy): Promise<void>
}
