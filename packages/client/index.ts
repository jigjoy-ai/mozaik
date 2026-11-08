import { JoinNetworkUseCase } from "./use-cases/join"
import { ConnectionRegistry } from "./connection-registry"
import { Peer } from "./peer/peer"
import { LeaveNetworkUseCase } from "./use-cases/leave"
import { SendMessageUseCase } from "./use-cases/send-message"
import { ReactToMessageUseCase } from "./use-cases/react"
import { Envelope } from "./peer/envelope"
import { ConditionSpecification } from "./peer/condition-specification"
import { InputResolver } from "./peer/input-resolver"
import { DirectiveRegistry } from "./peer/directive-registry"
import { InputResolverRegistry } from "./peer/input-resolver-registry"
import { RuleRegistry } from "./peer/rule-registry"

const connectionRegistry = new ConnectionRegistry()

export async function join(peer: Peer, networkId: string): Promise<void> {
	const useCase = new JoinNetworkUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId)
}

export async function leave(peer: Peer, networkId: string): Promise<void> {
	const useCase = new LeaveNetworkUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId)
}

export function sendMessage(peer: Peer, networkId: string, message: string): Promise<void> {
	const useCase = new SendMessageUseCase(connectionRegistry)
	return useCase.execute(peer, networkId, message)
}

export async function reactToMessage(peer: Peer, networkId: string, envelope: Envelope<any>): Promise<void> {
	const useCase = new ReactToMessageUseCase(connectionRegistry)
	return await useCase.execute(peer, networkId, envelope)
}

export const inputResolverRegistry = new InputResolverRegistry()

export const specificationRegistry = new RuleRegistry()
const directiveRegistry = new DirectiveRegistry()

// directiveRegistry.register("inference", inferenceOperation)

// const directiveProcessor = config.directiveProcessor ?? new DirectiveProcessor(directiveRegistry)

export function Input(options: { name: string }) {
	return function <T extends new () => InputResolver<unknown, unknown>>(
		ResolverClass: T,
		_context: ClassDecoratorContext,
	): void {
		inputResolverRegistry.register(options.name, new ResolverClass())
	}
}

export function Condition(options: { name: string }) {
	return function <T extends new () => ConditionSpecification>(
		SpecificationClass: T,
		_context: ClassDecoratorContext,
	): void {
		specificationRegistry.register(options.name, new SpecificationClass())
	}
}
