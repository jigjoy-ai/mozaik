import type { InferenceRequest, InferenceResult, InferenceRunner } from "@agent/inference/inference-runner"
import type { InferenceRequestValidator } from "@agent/inference/request-validation/inference-request-validator"
import { GenerativeModel } from "@agent/inference/generative-model"
import { RuntimeEvent } from "@environment/domain/event"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class DefaultInferenceRunner implements InferenceRunner {
	constructor(
		private readonly supportedModels: GenerativeModel[],
		private readonly requestValidator: InferenceRequestValidator,
	) {}

	async run(input: InferenceRequest): Promise<InferenceResult> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return await generativeModel.endpoint.infer(input)
	}

	async *stream(input: InferenceRequest): AsyncGenerator<RuntimeEvent> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		yield* generativeModel.endpoint.stream(input)
	}
}
