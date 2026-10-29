import { Tool } from "./tool"

export class ToolRegistry {
	private tools: Map<string, Tool> = new Map()

	registerTool(name: string, tool: Tool) {
		this.tools.set(name, tool)
	}

	getTool(name: string): Tool | undefined {
		return this.tools.get(name)
	}
}
