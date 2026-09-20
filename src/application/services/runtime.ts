import { DomainModel } from "@domain/runtime/runtime-state"
import { InferenceRunner } from "@domain/generative-model/inference-runner"
import { FunctionCallRunner } from "@domain/agent/loop/states/function-call"

export class RuntimeService<TModel extends DomainModel> {
	constructor(
		public readonly model: TModel,
		private readonly inferenceRunner: InferenceRunner,
		private readonly functionCallRunner: FunctionCallRunner,
	) {}

	getInferenceRunner(): InferenceRunner {
		return this.inferenceRunner
	}

	getFunctionCallRunner(): FunctionCallRunner {
		return this.functionCallRunner
	}
}
