import { IdGenerator } from "@util/id-generator"

export class UuidGenerator implements IdGenerator {
	generate(): string {
		return crypto.randomUUID()
	}
}
