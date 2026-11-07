import type { InferenceRequest } from "@agent/domain/inference/inference-request"
import { InputResolver } from "@network/peer/input-resolver"
import { AgentLoop } from "@agent/domain/loop/loop"
import { Input } from "@network/index"

@Input({ name: "standard.request" })
export class StandardInferenceRequest implements InputResolver<InferenceRequest> {
	resolve(agentLoop: AgentLoop): Promise<InferenceRequest> {
		const { agent } = agentLoop
		return Promise.resolve({
			model: "gpt-5.5",
			tools: agent.tools,
			context: {
				items: [
					{
						type: "developer_message",
						text: "You are a helpful assistant.",
					},
				],
			},
		})
	}
}
