import { ArbitrationError, type ArbitrationOptions } from "./core.js"
/** Total deadline; abort is advisory for injected implementations. Late settlement is ignored. */
export async function withDeadline<T>(
	work: (signal: AbortSignal) => Promise<T>,
	options: ArbitrationOptions = {},
): Promise<T> {
	const ms = options.timeoutMs ?? 10_000
	if (!Number.isFinite(ms) || ms <= 0 || ms > 2_147_483_647) throw new ArbitrationError("invalid_request")
	const controller = new AbortController()
	let timer: ReturnType<typeof setTimeout> | undefined
	let abort = () => {}
	try {
		return await new Promise<T>((resolve, reject) => {
			const stop = (code: "timeout" | "cancelled") => {
				reject(new ArbitrationError(code))
				controller.abort()
			}
			abort = () => stop("cancelled")
			if (options.signal?.aborted) {
				abort()
				return
			}
			options.signal?.addEventListener("abort", abort, { once: true })
			timer = setTimeout(() => stop("timeout"), ms)
			Promise.resolve()
				.then(() => {
					if (controller.signal.aborted) throw new ArbitrationError("cancelled")
					return work(controller.signal)
				})
				.then(resolve, reject)
		})
	} finally {
		clearTimeout(timer)
		options.signal?.removeEventListener("abort", abort)
	}
}
