import { Clock } from "@util/clock"

export class SystemClock implements Clock {
	now(): Date {
		return new Date()
	}
}
