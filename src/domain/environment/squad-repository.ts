import { Squad } from "./squad"

export interface SquadRepository {
	save(squad: Squad): Promise<void>
	delete(id: string): Promise<void>
	getById(id: string): Promise<Squad | null>
	getAllByOwnerId(ownerId: string): Promise<Squad[]>
}
