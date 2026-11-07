import { TokenUsage } from "@agent/domain/inference/token-usage"
import { ModelOutputItem } from "@agent/domain/inference/context"

export type InferenceResult = {
	items: ModelOutputItem[]
	tokenUsage: TokenUsage | undefined
	rowResponse: any
}
