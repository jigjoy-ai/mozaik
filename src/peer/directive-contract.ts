export interface DirectiveContract {
	type: string
	description: string
	inputSchema: Record<string, unknown>
	outputSchema: Record<string, unknown>
}
