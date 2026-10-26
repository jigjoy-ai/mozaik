import { EnvelopeSpecificationRegistry } from "@peer/envelope-specification-registry"
import { EnvelopeSpecification } from "@peer/envelope-specification"
import { Envelope } from "@peer/envelope"

export class MessageSentRule extends EnvelopeSpecification {
	isSatisfiedBy(envelope: Envelope<any>) {
		return envelope.type === "message.sent"
	}
}

const specificationRegistry = new EnvelopeSpecificationRegistry()
specificationRegistry.register("message.sent", new MessageSentRule())

export { specificationRegistry }
