import { ContextItem } from "@domain/generative-model/context/item"
import { InputText } from "@domain/generative-model/context/items/item-content/input-text"

export class FunctionCallOutputItem extends ContextItem {
	readonly type = "function_call_output"
	readonly callId: string
	readonly output: InputText

	private constructor(callId: string, output: InputText) {
		super()
		this.callId = callId
		this.output = output
	}

	static create(callId: string, output: string): FunctionCallOutputItem {
		const outputText = InputText.create(output)
		return new FunctionCallOutputItem(callId, outputText)
	}

	static rehydrate(data: { callId: string; output: InputText }): FunctionCallOutputItem {
		return new FunctionCallOutputItem(data.callId, data.output)
	}
}
