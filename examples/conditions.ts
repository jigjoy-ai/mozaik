import { ConditionSpecification } from "@peer/condition-specification"
import { Envelope } from "@peer/envelope"
import { Condition } from "@agent/agent-module"

@Condition({ name: "message.received" })
export class MessageReceivedCondition extends ConditionSpecification {
	isSatisfiedBy(envelope: Envelope<any>) {
		return envelope.type === "message"
	}
}
