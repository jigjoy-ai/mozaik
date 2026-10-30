# ADR: independent JEV workspace adapter

The inspected checkout (34f3027) is a single-package repository, not a configured
monorepo. Its root package is @mozaik-ai/core 4.2.0-beta.18; the initial branch was
development. The requested feature/jev-adapter branch was created. No prior
adapter implementation or repository AGENTS.md was present.

The root beta source exports agent modules rather than defineRuntime and even
references a missing util/index. We will not repair or change these core APIs.
Published @mozaik-ai/core 4.1.0 has the documented runtime API, verified directly
in its npm declarations. Compatibility is restricted to that exact release.

Add adapters/jev as an npm workspace; root changes are workspace metadata only. The adapter installs published 4.1.0 instead of linking the
incompatible root beta. Existing yarn.lock remains upstream history; npm is the
adapter's canonical installer. The upstream root has conflicting optional peers
(mem0ai versus Anthropic/Google SDK versions); install inside adapters/jev with
--workspaces=false and its independent lockfile to avoid resolving root dependencies.

The spike uses only public imports, initializes RuntimeState once, joins a
participant, sends a request, and publishes an asynchronous completion. No
runtime, inference provider, second event bus, or upstream extension is needed.
Situation processors are not awaited: asynchronous tasks must contain rejection
handling. Runtime-bound sendEvent requires a joined sender. The application owns
membership; the bridge supplies a handler and disposal.

Verified sources:
- https://docs.jigjoy.ai/docs/runtime
- https://docs.jigjoy.ai/docs/package-exports
- https://docs.jigjoy.ai/docs/semantic-events
- https://docs.jigjoy.ai/docs/situation-handlers
- https://docs.jigjoy.ai/docs/concurrent-agents
- https://github.com/jigjoy-ai/mozaik

TypeSafe @typesafe-ai/sdk 0.7.0 declarations verify TypeSafeClient (environment
TYPESAFE_API_KEY), systemOne(request, options), choice(instructions, criteria),
answers.<question>.{type,choice,confidence,probabilities}. Per-call options include
signal, timeout (per attempt), and retry. Adapter total deadlines remain separate.
SDK errors include AuthenticationError, RateLimitError, APIConnectionError,
APITimeoutError and APIUserAbortError. Node 22+ is required.

SDK references:
- https://docs.typesafe.ai/sdk/javascript
- https://docs.typesafe.ai/primitives
- https://docs.typesafe.ai/primitives/choice
- https://docs.typesafe.ai/confidence
- https://docs.typesafe.ai/api/system-one

One Choice includes an abstain option. Confidence is returned by the SDK and is
derived there from the distribution, not a safety guarantee or Noul probability.
No live request is needed for verification; tests inject the official SDK client
or its HTTP fetch boundary. Do not claim live service validation.
