import { Rulebook } from "@peer/rulebook"

export interface RulebookRepository {
	findById(id: string): Promise<Rulebook | undefined>
	save(rulebook: Rulebook): Promise<void>
}
