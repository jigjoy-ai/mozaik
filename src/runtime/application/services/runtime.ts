import { DomainModel } from "src/runtime/domain/runtime/domain-model"
import { InferenceRunner } from "src/runtime/domain/generative-model/inference-runner"
import { ToolUseRunner } from "src/runtime/domain/generative-model/tool-use-runner"

export class RuntimeService<TModel extends DomainModel> {
	constructor(
		public readonly model: TModel,
		private readonly inferenceRunner: InferenceRunner,
		private readonly toolUseRunner: ToolUseRunner,
	) {}

	getInferenceRunner(): InferenceRunner {
		return this.inferenceRunner
	}

	getToolUseRunner(): ToolUseRunner {
		return this.toolUseRunner
	}
}
