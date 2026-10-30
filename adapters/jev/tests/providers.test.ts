import { it, expect, vi } from "vitest"
import { z } from "zod"
import { TypeSafeClient } from "@typesafe-ai/sdk"
import { TypeSafeJevAdapter, MockJevAdapter, mockFixtures } from "../src/providers.js"
import { request } from "./fixture.js"
const config = {
	stateSchema: z.object({}),
	proposalSchema: z.object({}),
	instructions: "Which proposal best matches the state?",
}
const response = (choice = "candidate_0") => ({
	answers: {
		decision: { type: "choice", choice, confidence: 0.42, probabilities: { candidate_0: 0.8, abstain: 0.2 } },
	},
})
it("builds a single Choice and preserves real measurements", async () => {
	const systemOne = vi.fn(async () => response())
	const r = await new TypeSafeJevAdapter({ ...config, client: { systemOne } }).arbitrate(request)
	expect(r).toMatchObject({
		status: "selected",
		selectedCandidateId: "a",
		confidence: 0.42,
		probabilities: { a: 0.8 },
		abstainProbability: 0.2,
		measurements: "model",
	})
	expect(systemOne.mock.calls[0]).toBeDefined()
	const body = systemOne.mock.calls[0] as unknown as [Record<string, unknown>]
	expect(body[0]).toMatchObject({
		questions: { decision: { type: "choice", criteria: { candidate_0: "A", abstain: expect.any(String) } } },
	})
})
it.each(["abstain", "invented"])("validates choice %s", async (choice) => {
	const r = await new TypeSafeJevAdapter({
		...config,
		client: { systemOne: async () => response(choice) },
	}).arbitrate(request)
	expect(r.status).toBe(choice === "abstain" ? "abstained" : "error")
})
it("uses null when measurements absent", async () => {
	const r = await new TypeSafeJevAdapter({
		...config,
		client: { systemOne: async () => ({ answers: { decision: { type: "choice", choice: "candidate_0" } } }) },
	}).arbitrate(request)
	expect(r.confidence).toBeNull()
	expect(r.probabilities).toBeNull()
})
it.each([401, 429, 500])("normalizes SDK HTTP %s without leaking body", async (status) => {
	const client = new TypeSafeClient({
		apiKey: "test-only",
		compression: false,
		logLevel: "off",
		fetch: async () => new Response("secret", { status }),
	})
	const r = await new TypeSafeJevAdapter({ ...config, client }).arbitrate(request)
	expect(r).toMatchObject({
		status: "error",
		errorCode: status === 401 ? "authentication" : status === 429 ? "rate_limit" : "provider",
	})
	expect(JSON.stringify(r)).not.toContain("secret")
})
it("normalizes SDK network failure", async () => {
	const client = new TypeSafeClient({
		apiKey: "test-only",
		logLevel: "off",
		fetch: async () => {
			throw Error("secret")
		},
	})
	expect(await new TypeSafeJevAdapter({ ...config, client }).arbitrate(request)).toMatchObject({
		status: "error",
		errorCode: "network",
	})
})
it("discards late completion and requests cancellation", async () => {
	let signal: AbortSignal | undefined
	const provider = new TypeSafeJevAdapter({
		...config,
		client: {
			systemOne: async (_r, o) => {
				signal = o?.signal
				await new Promise((r) => setTimeout(r, 30))
				return response()
			},
		},
	})
	expect(await provider.arbitrate(request, { timeoutMs: 5 })).toMatchObject({
		status: "timeout",
		selectedCandidateId: null,
	})
	expect(signal?.aborted).toBe(true)
	await new Promise((r) => setTimeout(r, 40))
})
it("does not call client for already aborted requests", async () => {
	const systemOne = vi.fn(async () => response())
	const c = new AbortController()
	c.abort()
	expect(
		await new TypeSafeJevAdapter({ ...config, client: { systemOne } }).arbitrate(request, { signal: c.signal }),
	).toMatchObject({ status: "error", errorCode: "cancelled" })
	expect(systemOne).not.toHaveBeenCalled()
})
it.each(mockFixtures)("offline fixture %s is deterministic", async (fixture) => {
	const provider = new MockJevAdapter({ ...config, fixture })
	const r = await provider.arbitrate({
		...request,
		candidates: [...request.candidates, { ...request.candidates[0], id: "b" }],
	})
	expect(r.source).toBe("mock")
	expect(r.status).toBe(
		fixture === "abstain"
			? "abstained"
			: fixture === "error" || fixture === "malformed"
				? "error"
				: fixture === "timeout"
					? "timeout"
					: "selected",
	)
})
it.each([
	{ ...request, candidates: [] },
	{ ...request, candidates: [request.candidates[0], request.candidates[0]] },
	{ ...request, state: null },
])("rejects invalid requests without invoking SDK", async (input) => {
	const systemOne = vi.fn(async () => response())
	const r = await new TypeSafeJevAdapter({ ...config, client: { systemOne } }).arbitrate(input as typeof request)
	expect(r).toMatchObject({ status: "error", errorCode: "invalid_request" })
	expect(systemOne).not.toHaveBeenCalled()
})
it.each([
	{ type: "choice", choice: "candidate_0", confidence: 2 },
	{ type: "choice", choice: "candidate_0", probabilities: { candidate_0: 0.9 } },
	{ type: "choice", choice: "candidate_0", probabilities: { candidate_0: 0.9, abstain: 0.9 } },
	{ type: "noul", choice: "candidate_0" },
])("rejects malformed SDK measurements", async (decision) => {
	expect(
		await new TypeSafeJevAdapter({
			...config,
			client: { systemOne: async () => ({ answers: { decision } }) },
		}).arbitrate(request),
	).toMatchObject({ status: "error", errorCode: "invalid_response" })
})
it("maps hostile candidate IDs without using them as SDK option names", async () => {
	const input = { ...request, candidates: [{ ...request.candidates[0], id: "__proto__" }] }
	const r = await new TypeSafeJevAdapter({ ...config, client: { systemOne: async () => response() } }).arbitrate(
		input,
	)
	expect(r.selectedCandidateId).toBe("__proto__")
	expect(Object.hasOwn(r.probabilities!, "__proto__")).toBe(true)
})

it("normalizes a successful response through the official SDK HTTP parser", async () => {
	const client = new TypeSafeClient({
		apiKey: "test-only",
		logLevel: "off",
		compression: false,
		fetch: async () =>
			new Response(
				JSON.stringify({
					...response(),
					model: "jev-latest",
					usage: { input_tokens: 10, output_tokens: 3 },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
	})
	const result = await new TypeSafeJevAdapter({ ...config, client }).arbitrate(request)
	expect(result).toMatchObject({
		status: "selected",
		selectedCandidateId: "a",
		confidence: 0.42,
		probabilities: { a: 0.8 },
	})
})
