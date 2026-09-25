export interface ContextItem {
	readonly type: string
}

export interface ItemContent {
	readonly type: string
}

export interface InputText extends ItemContent {
	readonly type: "input_text"
	readonly text: string
}

export interface OutputText extends ItemContent {
	readonly type: "output_text"
	readonly text: string
}

export interface SummaryText {
	readonly type: "summary_text"
	readonly text: string
}

export interface ReasoningItem extends ContextItem {
	readonly type: "reasoning"
	readonly content?: InputText
	readonly encryptedContent?: string
	readonly summary: SummaryText[]
}

export interface MessageItem extends ContextItem {
	readonly type: "user_message" | "system_message" | "developer_message" | "model_message"
	readonly content: ItemContent
}

export interface DeveloperMessageItem extends MessageItem {
	readonly type: "developer_message"
	readonly content: InputText
}

export interface SystemMessageItem extends MessageItem {
	readonly type: "system_message"
	readonly content: InputText
}

export interface UserMessageItem extends MessageItem {
	readonly type: "user_message"
	readonly content: InputText
}

export interface ModelMessageItem extends MessageItem {
	readonly type: "model_message"
	readonly content: OutputText
}

export interface ToolUseRequest extends ContextItem {
	readonly type: "tool_use_request"
	readonly requestId: string
	readonly toolName: string
	readonly toolArguments: string
}

export interface ToolUseResult extends ContextItem {
	readonly type: "tool_use_result"
	readonly requestId: string
	readonly result: InputText
}

export type ModelOutputItem = ModelMessageItem | ToolUseRequest | ReasoningItem

export type ModelContext = {
	readonly items: ContextItem[]
}
