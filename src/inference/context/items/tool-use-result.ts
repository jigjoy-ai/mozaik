import { ContextItem } from "src/inference/context/item"
import { InputText } from "src/inference/context/items/item-content/input-text"

export class ToolUseResult extends ContextItem {
	readonly type = "function_call_output"
	readonly callId: string
	readonly output: InputText

	private constructor(callId: string, output: InputText) {
		super()
		this.callId = callId
		this.output = output
	}

	static create(callId: string, output: string): ToolUseResult {
		const outputText = InputText.create(output)
		return new ToolUseResult(callId, outputText)
	}

	static rehydrate(data: { callId: string; output: InputText }): ToolUseResult {
		return new ToolUseResult(data.callId, data.output)
	}
}
