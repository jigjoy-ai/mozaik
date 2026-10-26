import { RuleSpecification } from "@peer/rule-specification"
import { Envelope } from "@peer/envelope"
import { Specification } from "@agent/agent-module"

@Specification({ name: "message.received" })
export class MessageReceivedRule extends RuleSpecification {
	isSatisfiedBy(envelope: Envelope<any>) {
		return envelope.type === "message"
	}
}
