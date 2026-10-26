import { Rulebook } from "@peer/rulebook"
import { RulebookRepository } from "@peer/rulebook-repository"

export class InMemoryRulebookRepository implements RulebookRepository {
	private readonly rulebooks: Map<string, Rulebook> = new Map()

	async findById(id: string): Promise<Rulebook | undefined> {
		return this.rulebooks.get(id)
	}

	async save(rulebook: Rulebook): Promise<void> {
		this.rulebooks.set(rulebook.getId(), rulebook)
	}
}
