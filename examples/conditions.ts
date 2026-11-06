import { ConditionSpecification } from "@network/peer/condition-specification"
import { Envelope } from "@network/peer/envelope"
import { Condition } from "@agent/agent-module"

@Condition({ name: "message.received" })
export class MessageReceivedCondition extends ConditionSpecification {
	isSatisfiedBy(envelope: Envelope<any>) {
		return envelope.type === "message"
	}
}
