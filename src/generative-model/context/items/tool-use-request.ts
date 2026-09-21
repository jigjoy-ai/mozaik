import { ContextItem } from "src/runtime/domain/generative-model/context/item"

export class ToolUseRequest extends ContextItem {
	readonly type = "function_call"
	readonly callId: string
	readonly name: string
	readonly args: string

	private constructor(callId: string, name: string, args: string) {
		super()
		this.callId = callId
		this.name = name
		this.args = args
	}

	static rehydrate(data: { callId: string; name: string; args: string }): ToolUseRequest {
		return new ToolUseRequest(data.callId, data.name, data.args)
	}
}
