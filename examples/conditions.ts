import { ConditionSpecification } from "@network/peer/condition-specification"
import { Envelope } from "@network/peer/envelope"
import { Condition } from "@network/index"

@Condition({ name: "message.received" })
export class MessageReceivedCondition extends ConditionSpecification {
	isSatisfiedBy(envelope: Envelope<any>) {
		return envelope.type === "message"
	}
}
