export interface FunctionTool {
	type: "function"
	name: string
	description: string
	parameters: Record<string, any>
	strict: boolean
	invoke: (args: any) => Promise<any>
}

export interface InternalTool<T extends string> {
	type: T
}

export type Tool = FunctionTool
