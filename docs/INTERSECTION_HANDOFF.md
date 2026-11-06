# Intersection backend integration handoff

The adapter is an independent workspace package at adapters/jev in this fork.
Intersection is a consumer; nothing in the adapter imports or modifies it.
No frontend change is required by the adapter: the backend can translate events
to its existing response or streaming contracts. Those private contracts were
not inspected, so their exact mapping remains the backend team's responsibility.

## Install and configure

Build a local npm archive with npm pack --workspaces=false from adapters/jev.
Install that tarball and @mozaik-ai/core@4.1.0 in the Intersection backend.
Node 22+ and ESM are required. The checkout's root beta is not supported.
The package name is mozaik-jev-adapter, currently unpublished.

Define Zod schemas for Intersection's state snapshot and proposal data. Pass
these same schemas to the provider and bridge so TypeScript inference matches
runtime validation. Do not put full simulation history or secrets in state.

For offline development, construct MockJevAdapter({ stateSchema,
proposalSchema, fixture:'agent-a' }). Fixtures also support agent-b, abstain,
low-confidence, error, timeout and malformed. Measurements are synthetic.
For live operation, construct TypeSafeJevAdapter({ stateSchema, proposalSchema,
instructions:'Which valid proposal best serves current demand? Abstain if none
is appropriate.' }). TYPESAFE_API_KEY is read server-side by the official SDK.
Optional SDK environment variables are TYPESAFE_BASE_URL and
TYPESAFE_DEFAULT_MODEL. Mock mode has no credentials. Catch live constructor
errors (including missing credentials) at application startup.

## Runtime and ownership

Initialize the application's defineRuntime result exactly once with a
RuntimeState subclass. Use its bound sendEvent, join, leave and runLoop functions.
Create one bridge participant with createHuman, create the bridge with that
participantId and runtime, register bridge.handler, then join the participant.
Use the full setup shown in adapters/jev/README.md.

The backend owns:
- Collecting both agents' proposals; no arbitration before both arrive.
- Session IDs, decision-cycle IDs, generation counters and state versions.
- isCurrent: synchronously compare all those identifiers to current state.
- Observing completion/failure events and routing them to existing consumers.
- Authorization, safety checks, execution and execution outcome recording.
- bridge.dispose() before runtime.leave(participant), and handler removal.

The bridge owns bounded scheduling, request validation, total deadlines,
deduplication, SDK invocation and normalized recommendation events. It does not
create agents, update traffic lights, mutate shared state, or provide an
inference model. Gemini may continue supplying proposals independently.

## Request and result

Publish SemanticEvent.create(events.requested, joinedSenderId, request) through
runtime.sendEvent(event, joinedSenderId). Example request:

```json
{
  "requestId": "junction-7-cycle-42",
  "sessionId": "junction-7",
  "cycleId": "42",
  "generation": 3,
  "stateVersion": 128,
  "state": {"allRed": true, "northSouthQueue": 12, "eastWestQueue": 8},
  "candidates": [
    {"id": "ns", "producerId": "agent-a", "label": "North/South green", "proposal": {"green": "north-south"}},
    {"id": "ew", "producerId": "agent-b", "label": "East/West green", "proposal": {"green": "east-west"}}
  ]
}
```

Example mock result (synthetic confidence and probabilities):

```json
{
  "requestId": "junction-7-cycle-42", "sessionId": "junction-7",
  "cycleId": "42", "generation": 3, "stateVersion": 128,
  "status": "selected", "selectedCandidateId": "ns",
  "source": "mock", "measurements": "synthetic",
  "confidence": 1, "probabilities": {"ns": 1, "ew": 0},
  "abstainProbability": 0, "latencyMs": 1
}
```

Live confidence is preserved unchanged or null if unavailable; candidate
probabilities plus abstainProbability preserve the full Choice distribution.
Do not treat confidence as the probability that an action is safe.

## Event mappings and fallback

All events are under jev.v1.arbitration. The requested event carries the request.
Output payloads have version:1, phase, requestId, sessionId, cycleId, generation
and stateVersion. Result-bearing events put the normalized result under result.
Bridge-generated failures/discards carry a safe reason instead.

| Event suffix | Suggested backend treatment |
| --- | --- |
| started | Mark decision pending |
| completed | Recheck freshness, candidate membership, authorization and traffic safety; then accept or reject |
| abstained | Keep safe fallback; no action selected |
| timed_out | End wait and apply deterministic safe fallback |
| failed | Record safe code; fallback or request operator review |
| discarded | Ignore as an actionable decision; distinguish stale, capacity and duplicate-cycle reasons |

Duplicate request IDs are ignored within the bounded retention window.
Malformed envelopes use onDiagnostic('invalid_envelope'); event delivery failure
uses onDiagnostic('publication_failed'). Provide monitoring for these diagnostics.

The lifecycle is validation → in flight → one completion, abstention, timeout,
failure or discard. Generation changes and state changes make pending decisions
stale through isCurrent. Recheck before execution even after completed: state
can change immediately after publication. Persist executed cycle IDs yourself
if replay prevention must survive restart or cache expiry.

Defaults: maxConcurrent=8, timeoutMs=10000, dedupeSize=1024 total request/cycle
entries, dedupeTtlMs=60000, no queue or retries. Capacity exhaustion discards.
Never automatically select an arbitrary candidate on error. Keep the simulation's
existing safe fallback; its rules remain outside this generic package.

SDK cancellation requests abort; late results are ignored even if the network
implementation does not stop. A custom provider ignoring cancellation continues
to occupy capacity until settled. Disposal suppresses all future bridge events.

See adapters/jev/examples/traffic.ts for the minimal separate safety gate and
examples/concurrent.ts for two overlapping offline Mozaik agent loops.
