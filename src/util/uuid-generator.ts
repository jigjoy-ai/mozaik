import { IdGenerator } from "./id-generator"

export class UuidGenerator implements IdGenerator {
	generate(): string {
		return crypto.randomUUID()
	}
}
