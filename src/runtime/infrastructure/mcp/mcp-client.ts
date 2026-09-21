import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

export interface McpServerConfig {
	/** The MCP server URL, e.g. https://api.githubcopilot.com/mcp/ */
	url: string
	/** Bearer token sent as `Authorization: Bearer <token>` (e.g. a GitHub token). */
	authToken?: string
	/** Extra headers merged into every request (overridden by `authToken` for Authorization). */
	headers?: Record<string, string>
	/** Client name reported to the server (defaults to "mozaik"). */
	name?: string
}

export interface McpToolSpec {
	name: string
	description: string
	/** JSON Schema for the tool's arguments (maps 1:1 to FunctionTool.parameters). */
	inputSchema: Record<string, any>
}

/**
 * A thin wrapper over the MCP TypeScript SDK using the Streamable HTTP transport — what
 * remote MCP servers (e.g. GitHub's `api.githubcopilot.com/mcp/`) speak. One client per
 * server; lazily connects on first use. Infrastructure-only: the domain never sees this.
 */
export class McpClient {
	private readonly client: Client
	private readonly transport: StreamableHTTPClientTransport
	private connected = false

	constructor(private readonly config: McpServerConfig) {
		const headers: Record<string, string> = { ...(config.headers ?? {}) }
		if (config.authToken) headers.Authorization = `Bearer ${config.authToken}`
		this.transport = new StreamableHTTPClientTransport(
			new URL(config.url),
			Object.keys(headers).length > 0 ? { requestInit: { headers } } : undefined,
		)
		this.client = new Client({ name: config.name ?? "mozaik", version: "1.0.0" }, { capabilities: {} })
	}

	async connect(): Promise<void> {
		if (this.connected) return
		await this.client.connect(this.transport)
		this.connected = true
	}

	/** The tools this server exposes. */
	async listTools(): Promise<McpToolSpec[]> {
		await this.connect()
		const res = await this.client.listTools()
		return (res.tools ?? []).map((t) => ({
			name: t.name,
			description: t.description ?? "",
			inputSchema: (t.inputSchema as Record<string, any>) ?? { type: "object", properties: {} },
		}))
	}

	/** Call a tool by name; returns its text output. Throws if the server flags an error. */
	async callTool(name: string, args: Record<string, any>): Promise<string> {
		await this.connect()
		const res = await this.client.callTool({ name, arguments: args ?? {} })
		const text = extractText(res)
		if ((res as { isError?: boolean }).isError) {
			throw new Error(`MCP tool "${name}" failed: ${text || "unknown error"}`)
		}
		return text
	}

	async close(): Promise<void> {
		if (!this.connected) return
		try {
			await this.client.close()
		} catch {
			// best-effort teardown — the transport may already be gone
		}
		this.connected = false
	}
}

/** Concatenate the text blocks of an MCP tool result (ignores non-text content). */
function extractText(res: unknown): string {
	const content = (res as { content?: unknown }).content
	if (!Array.isArray(content)) return ""
	return content
		.filter((c): c is { type: "text"; text: string } => (c as { type?: string })?.type === "text" && typeof (c as { text?: unknown }).text === "string")
		.map((c) => c.text)
		.join("\n")
}
