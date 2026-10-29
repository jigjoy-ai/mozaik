export interface ToolDefinition {
	name: string
	description: string
	parameters: Record<string, unknown>
	strict: boolean
}

export interface Tool {
	invoke: (args: Record<string, unknown>) => Promise<unknown> | unknown
}
