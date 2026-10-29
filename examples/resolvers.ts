import { InferenceRequest } from "@inference/index"
import { InputResolver } from "@peer/input-resolver"
import { AgentLoop } from "@agent/domain/loop/loop"
import { Input } from "@agent/agent-module"

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
