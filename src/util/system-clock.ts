import { Clock } from "./clock"

export class SystemClock implements Clock {
	now(): Date {
		return new Date()
	}
}
