import { Loop } from "@agent/loop"
import { LoopRuleEngine } from "@agent/loop/controller"
import { InferenceRunner } from "@inference/inference-runner"

export class AdvanceLoopUseCase {
	private readonly loopRuleEngine: LoopRuleEngine
	constructor(private readonly inferenceRunner: InferenceRunner) {
		this.loopRuleEngine = new LoopRuleEngine()
	}

	async execute(loop: Loop): Promise<Loop> {
		const next = this.loopRuleEngine.decide(loop)
		console.log("decision:", next)

		if (next?.type === "inference") {
			const pending = loop.requestInference("op-1", next.request, new Date())
			const result = await this.inferenceRunner.run(next.request)
			loop.receiveInferenceResult(pending.id, result, new Date())
			console.log("model output:", result.items)
		}

		return loop
	}
}
