import { Memory } from "@agent/domain/memory"
import { AgentRecord } from "@agent/domain/record"
import { UuidGenerator } from "@util/uuid-generator"
import { Contract } from "@peer/contract"

export class Agent {
	private _id: string
	private _name: string
	private _instruction: string
	private _memory: Memory
	private _tools: Contract[]

	constructor(id: string, name: string, instruction: string, tools: Contract[], memory: Memory) {
		this._id = id
		this._name = name
		this._instruction = instruction
		this._memory = memory
		this._tools = tools
	}

	get id(): string {
		return this._id
	}

	get name(): string {
		return this._name
	}

	get instruction(): string {
		return this._instruction
	}

	get tools(): Contract[] {
		return this._tools
	}

	get memory(): Memory {
		return this._memory
	}

	static create({
		name,
		instruction,
		tools,
		memory,
	}: {
		name: string
		instruction: string
		tools: Contract[]
		memory: Memory
	}): Agent {
		const id = UuidGenerator.create()
		return new Agent(id, name, instruction, tools, memory)
	}

	static rehydrate(record: AgentRecord): Agent {
		return new Agent(record.id, record.name, record.instruction, record.tools, record.memory)
	}
}
