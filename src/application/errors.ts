export type ErrorCode = "unauthorized" | "forbidden" | "not_found" | "payment_required"

/** An error the client caused or can act on: its code and message are sent back as they are. */
export class RequestError extends Error {
	constructor(
		readonly code: ErrorCode,
		message: string,
	) {
		super(message)
	}
}
