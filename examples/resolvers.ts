import { InferenceRequest } from "@inference/index"
import { InputResolver } from "@peer/input-resolver"
import { Agent } from "@agent/index"
import { Resolver } from "@agent/agent-module"

@Resolver({ name: "standard.llm.request" })
export class StandardInferenceRequest implements InputResolver<InferenceRequest> {
	resolve(agent: Agent): Promise<InferenceRequest> {
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
