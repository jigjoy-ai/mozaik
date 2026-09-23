import type { FunctionTool } from "@agent/domain/inference/tool"
import { McpClient, type McpServerConfig } from "@agent/domain/inference/mcp/mcp-client"

/** The slice of an MCP client the registry needs — lets tests inject a fake. */
export interface McpClientLike {
	listTools(): Promise<Array<{ name: string; description: string; inputSchema: Record<string, any> }>>
	callTool(name: string, args: Record<string, any>): Promise<string>
	close(): Promise<void>
}

/**
 * Connects to one or more MCP servers and exposes their tools as mozaik `FunctionTool`s.
 * Each tool's `invoke()` proxies the call back to its MCP server. Because they are plain
 * FunctionTools, every provider mapper and the existing function-call loop handle them
 * with no changes — MCP support adds no new tool type and touches no provider code.
 *
 * `strict` is false: MCP servers publish arbitrary JSON Schemas that won't always satisfy
 * a provider's strict function-calling mode.
 */
export class McpToolRegistry {
	private readonly clients: McpClientLike[] = []

	constructor(
		private readonly servers: McpServerConfig[],
		private readonly createClient: (config: McpServerConfig) => McpClientLike = (config) => new McpClient(config),
	) {}

	/** Discover every tool across the configured servers, as FunctionTools ready to pass to a model. */
	async discoverTools(): Promise<FunctionTool[]> {
		const tools: FunctionTool[] = []
		for (const server of this.servers) {
			const client = this.createClient(server)
			this.clients.push(client)
			for (const spec of await client.listTools()) {
				tools.push({
					type: "function",
					name: spec.name,
					description: spec.description,
					parameters: spec.inputSchema,
					strict: false,
					invoke: (args: unknown) => client.callTool(spec.name, (args as Record<string, any>) ?? {}),
				})
			}
		}
		return tools
	}

	/** Close all underlying MCP connections. */
	async close(): Promise<void> {
		await Promise.all(this.clients.map((c) => c.close()))
	}
}
