import { TokenUsage } from "./token-usage"
import { ModelOutputItem } from "./context"

export type InferenceResult = {
	items: ModelOutputItem[]
	tokenUsage: TokenUsage | undefined
	rowResponse: any
}
