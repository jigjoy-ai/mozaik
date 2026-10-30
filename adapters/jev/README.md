# Mozaik JEV adapter

Independent, typed arbitration for competing proposals from Mozaik agents.
Use it when several agents offer structured recommendations and your application
needs one closed-set JEV decision, including the option to abstain.

The provider calls the official TypeSafe SDK. The bridge publishes recommendations
through your existing Mozaik runtime. It never executes a selected proposal,
creates a runtime, or replaces an inference model. No endorsement by JigJoy or
TypeSafe is implied.

## Compatibility and installation

| Component                 | Verified version                                             |
| ------------------------- | ------------------------------------------------------------ |
| Mozaik public runtime API | @mozaik-ai/core **4.1.0**, exact peer                        |
| TypeSafe SDK              | @typesafe-ai/sdk **0.7.0**                                   |
| Node                      | Requires 22+; locally tested on 24.22.1; CI covers 22 and 24 |
| Module format             | ESM with TypeScript declarations; CommonJS not offered       |

This fork's root 4.2.0-beta.18 API differs from the documented runtime API.
The adapter uses published 4.1.0, without modifying core. Do not link the root
beta as the adapter's peer. Other releases are not claimed compatible.

The package is not published. Build and install a local archive:

```sh
cd adapters/jev
npm ci --workspaces=false
npm run check
npm pack --workspaces=false
# In the consuming application:
npm install /absolute/path/mozaik-jev-adapter-0.1.0.tgz @mozaik-ai/core@4.1.0
```

The independent lockfile intentionally avoids the root project's pre-existing
optional-peer conflicts. Root yarn.lock and package-lock.json belong to upstream.
Run adapter commands inside this directory. Future registry installation uses
the unscoped package name after an authorized publication and availability check.

## Quickstart: fully offline

```ts
import { z } from "zod"
import { MockJevAdapter } from "mozaik-jev-adapter"

const schemas = {
	stateSchema: z.object({ objective: z.string() }),
	proposalSchema: z.object({ action: z.string() }),
}
const provider = new MockJevAdapter({ ...schemas, fixture: "agent-a" })
const request = {
	requestId: "r1",
	sessionId: "s1",
	cycleId: "c1",
	generation: 0,
	stateVersion: 1,
	state: { objective: "Respond promptly" },
	candidates: [
		{ id: "a", producerId: "agent-a", label: "Respond now", proposal: { action: "reply" } },
		{ id: "b", producerId: "agent-b", label: "Review first", proposal: { action: "review" } },
	],
}
const result = await provider.arbitrate(request, { timeoutMs: 1000 })
if (result.status === "selected") console.log(result.selectedCandidateId)
```

Schemas are required, so generic types and runtime validation agree. Inputs must
be finite JSON data with depth at most 64 and serialized size at most 256,000
characters. Candidate IDs must be unique; 1–100 candidates are supported.
Correlation IDs are nonempty strings of at most 128 characters; versions are
nonnegative integers. Invalid correlation envelopes reject; invalid state or
candidates with valid correlation produce an error result.

## Live TypeSafe

On the server, set TYPESAFE_API_KEY and replace the provider:

```ts
import { TypeSafeJevAdapter } from "mozaik-jev-adapter/providers"
const provider = new TypeSafeJevAdapter({
	...schemas,
	instructions: "Which proposal best satisfies the objective? Abstain if none fits.",
})
```

This subpath does not import Mozaik. The SDK reads its documented environment
configuration (also TYPESAFE_BASE_URL and TYPESAFE_DEFAULT_MODEL). The adapter
disables SDK logging and retries by default; injected clients own their logging
policy. Never place API keys in browser bundles, request state, or event payloads.
Client construction can throw for missing credentials. Tests use a JevClient
or the official client's injected fetch; no live service call was made.

The SDK's signal and per-attempt timeout are passed through. A separate total
deadline discards late settlements. Abort is advisory for custom clients; no
claim is made that a remote computation was stopped. There are no automatic
adapter retries. Use new request and cycle IDs for an application-approved retry.

## Connect to an existing Mozaik runtime

```ts
import { createHuman, SemanticEvent } from "@mozaik-ai/core"
import { createJevBridge, events } from "mozaik-jev-adapter"
// runtime is the object returned by defineRuntime(), already initialized.
const participant = createHuman({ name: "JEV bridge", capabilities: [], handlers: [] })
const bridge = createJevBridge({
	...schemas,
	provider,
	runtime,
	participantId: participant.getId(),
	isCurrent: (r) =>
		r.sessionId === current.sessionId &&
		r.generation === current.generation &&
		r.cycleId === current.cycleId &&
		r.stateVersion === current.stateVersion,
	onDiagnostic: (code) => console.warn(code),
})
participant.setHandlers([bridge.handler])
runtime.join(participant)
runtime.sendEvent(SemanticEvent.create(events.requested, participant.getId(), request), participant.getId())
// On shutdown, before removing the sender:
bridge.dispose()
runtime.leave(participant)
```

Register a separate situation handler for completion events; see
[the runnable concurrent example](https://github.com/Bucov/mozaik-Jev-adapter/blob/feature/jev-adapter/adapters/jev/examples/concurrent.ts). If attaching to an
existing participant, append the handler to its existing handlers instead of
replacing them. Remove that handler on cleanup. The bridge owns no membership.

## API and events

| Export                                     | Purpose                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| ArbitrationRequest / ArbitrationCandidate  | Generic typed state and candidate proposals                    |
| ArbitrationProvider                        | Async arbitrate(request, {signal?, timeoutMs?}) contract       |
| ArbitrationResult / resultSchema           | Discriminated selected, abstained, timeout or error result     |
| requestSchema(stateSchema, proposalSchema) | Domain schema composition and ID validation                    |
| TypeSafeJevAdapter                         | Single SDK Choice, safe abstain, validated normalization       |
| MockJevAdapter / mockFixtures              | Seeded selection or controlled offline outcomes                |
| createJevBridge                            | handler, submit(request), dispose(), pendingCount, activeCount |
| JevSituationSpecification / events         | Request filter and versioned event names                       |
| eventPayloadSchema                         | Validation for emitted bridge payloads                         |
| ArbitrationError                           | Safe error code, without SDK response bodies                   |

All event names start with **jev.v1.arbitration.** Requested payloads are raw
ArbitrationRequest values. Other payloads have version:1, phase and all five
correlation fields. Provider outcomes carry result; bridge failures/discards
carry reason instead. Never assume every failed event contains result.

| Suffix    | Meaning                                                             |
| --------- | ------------------------------------------------------------------- |
| requested | Validated by bridge before admission                                |
| started   | Admitted to bounded processing                                      |
| completed | Valid current selected result                                       |
| abstained | No selection                                                        |
| failed    | Invalid request/result or provider error                            |
| timed_out | Total deadline or provider timeout                                  |
| discarded | Stale, duplicate cycle, or capacity rejection; no actionable result |

Duplicate request events are silently ignored. Malformed correlation envelopes
cannot produce correlated events and report invalid_envelope through
onDiagnostic. Publication exceptions report publication_failed; delivery cannot
be guaranteed if the runtime sender has left or another synchronous handler
throws. Application handlers must contain their own exceptions.

## Lifecycle and limits

Request → validation → in flight → one terminal outcome. Default maximum
concurrency is 8; no queue is maintained. Overload discards immediately.
Default total timeout is 10 seconds. Deduplication uses a bounded 1,024-entry
cache for request IDs (scoped by session) and cycle IDs (scoped by session and
generation), retained up to 60 seconds; each admitted request uses two entries.
Configure maxConcurrent, timeoutMs, dedupeSize, dedupeTtlMs as positive integers.

Idempotency is local, bounded and temporary, not durable exactly-once delivery.
Eviction, expiry, bridge recreation or process restart permits replay. Keep
application-owned cycle/authorization checks for durable execution safety.
isCurrent is required and called before admission and before terminal publication.
Check freshness again immediately before executing. All requests are snapshotted.
An abort-ignoring provider occupies a concurrency slot until physical settlement;
if it never settles, recreate the provider/bridge only after investigating it.
Disposal aborts pending tasks and suppresses future events; it cannot force a
custom provider to stop. activeCount can exceed pendingCount after a deadline.

## Measurements, errors and safety

Real results expose the SDK's confidence unchanged, or null if unavailable.
probabilities maps candidate IDs to returned probabilities;
abstainProbability preserves the separate abstention mass. Their combined mass
must be approximately one (0.01 rounding tolerance). No values are renormalized.
Confidence is TypeSafe's distribution statistic, not a safety guarantee.
latencyMs and correlation are adapter metadata. source is jev or mock;
measurements is model, synthetic, or none. Error results have no selected ID.

Error codes: invalid_request, invalid_response, authentication, rate_limit,
network, provider, cancelled, capacity. Timeouts have their own status.
Raw errors, credentials and response bodies are never included in results/events.
Applications decide whether to retry, fall back to deterministic policy, or
request human review. A high-confidence answer never overrides authorization,
state-version checks or deterministic safety rules.

Mock fixtures: agent-a, agent-b, abstain, low-confidence, error, timeout,
malformed. Agent-b requires a second candidate. Without a fixture, a numeric
seed picks a stable candidate by index. latencyMs simulates delay. The timeout
fixture returns a simulated timeout immediately; latency beyond timeoutMs tests
an actual deadline. All mock measurement values are synthetic demo data.

## Examples and development

Run these commands from adapters/jev in a source checkout. The npm archive contains
built library modules and declarations; examples and tests live in the repository.

```sh
npm run spike
npm run example:basic
npm run example:concurrent
npm run example:traffic
npm run check
npm run verify:package
```

The concurrent example uses actual Mozaik runLoop calls with an offline
InferenceRunner and asserts overlapping intervals. Traffic code is confined to
the example; its application gate checks all-red state and freshness.

See [architecture](https://github.com/Bucov/mozaik-Jev-adapter/blob/feature/jev-adapter/docs/ARCHITECTURE_DECISION.md),
[Intersection handoff](https://github.com/Bucov/mozaik-Jev-adapter/blob/feature/jev-adapter/docs/INTERSECTION_HANDOFF.md), and
[contribution instructions](CONTRIBUTING.md). MIT; upstream attribution retained.
