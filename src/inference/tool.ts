export interface FunctionTool {
	type: "function"
	name: string
	description: string
	parameters: Record<string, any>
	strict: boolean
	invoke: (args: any) => Promise<any> | any
}

export type Tool = FunctionTool
