export class Squad {
	private readonly id: string
	private readonly ownerId: string
	private name: string
	private members: string[]

	constructor(id: string, name: string, ownerId: string, members: string[]) {
		this.id = id
		this.ownerId = ownerId
		this.name = name
		this.members = members
	}

	addMember(memberId: string): void {
		const alreadyExists = this.members.find((m) => m === memberId)

		if (alreadyExists) return
		this.members.push(memberId)
	}

	removeMember(memberId: string): void {
		this.members = this.members.filter((m) => m !== memberId)
	}

	getId(): string {
		return this.id
	}

	getName(): string {
		return this.name
	}

	getOwnerId(): string {
		return this.ownerId
	}

	getMembers(): string[] {
		return [...this.members]
	}

	isMember(memberId: string): boolean {
		return this.members.includes(memberId)
	}

	static create(name: string, ownerId: string, members: string[] = []): Squad {
		const id = crypto.randomUUID()
		return new Squad(id, name, ownerId, members)
	}

	static rehydrate({
		id,
		name,
		ownerId,
		members,
	}: {
		id: string
		name: string
		ownerId: string
		members: string[]
	}): Squad {
		return new Squad(id, name, ownerId, members)
	}
}
