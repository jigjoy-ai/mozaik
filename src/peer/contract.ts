export interface Contract {
	id: string
	type: string
	description: string
	inputSchema: Record<string, unknown>
	outputSchema?: Record<string, unknown>
}
