export class IdGenerator {
	generate(): string {
		return crypto.randomUUID()
	}
}
