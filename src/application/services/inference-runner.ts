import type { InferenceInput, InferenceOutput, InferenceRunner } from "@domain/agent-loop/inference"
import type { InferenceInputValidator } from "@domain/generative-model/request-validation/inference-request-validator"
import { GenerativeModel } from "@domain/generative-model/generative-model"
import { SemanticEvent } from "@domain/agentic-environment/semantic-event/event"

export type InferenceCompletedParams = { answer: string; producerId: string; price?: number }

export class DefaultInferenceRunner implements InferenceRunner {
	constructor(
		private readonly supportedModels: GenerativeModel[],
		private readonly requestValidator: InferenceInputValidator,
	) {}

	async run(input: InferenceInput): Promise<InferenceOutput> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return await generativeModel.endpoint.infer(input)
	}

	async *stream(input: InferenceInput): AsyncGenerator<SemanticEvent> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		yield* generativeModel.endpoint.stream(input)
	}
}
