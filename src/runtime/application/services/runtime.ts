import { DomainModel } from "src/runtime/domain/runtime/domain-model"
import { InferenceRunner } from "src/inference/inference-runner"
import { ToolUseRunner } from "src/inference/tool-use-runner"

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
