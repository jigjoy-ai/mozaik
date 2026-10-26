import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { OperationRegistry } from "@peer/operation-registry"
import { Inference } from "@agent/application/operations/inference"
import { DefaultInferenceRunner } from "@agent/application/runners/inference-runner"
import { InferenceRequestValidator } from "@inference/request-validation/inference-request-validator"
import { supportedModels } from "@agent/infrastructure/providers/supported-models"

const inferenceRunner = new DefaultInferenceRunner(supportedModels, new InferenceRequestValidator())
const loopRepository = new InMemoryLoopRepository()
const inferenceOperation = new Inference(loopRepository, inferenceRunner)
const operationRegistry = new OperationRegistry()
operationRegistry.register("inference", inferenceOperation)

export { operationRegistry }
