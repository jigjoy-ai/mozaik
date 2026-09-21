import { Environment } from "@environment/domain/environment"

export interface EnvironmentRepository {
	save(environment: Environment): Promise<void>
	delete(id: string): Promise<void>
	getById(id: string): Promise<Environment | null>
	getAllByOwnerId(ownerId: string): Promise<Environment[]>
}
