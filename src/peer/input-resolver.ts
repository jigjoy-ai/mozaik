import { Agent } from "@agent/index"

export interface InputResolver<T> {
	resolve(agent: Agent): Promise<T>
}
