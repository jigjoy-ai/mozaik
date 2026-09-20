# MCP tool support — design notes

This module lets a run use **Model Context Protocol (MCP)** server tools (e.g. GitHub's
remote MCP server). This note explains the one design decision that draws questions in
review: **why an in-process MCP client instead of the provider's native MCP tool.**

## TL;DR

The provider-native MCP tool (e.g. OpenAI's `{ type: "mcp", server_url }`) is simpler, but:

- it is **OpenAI-models-only**, **Responses-API-only**, and runs the tool loop **server-side
  at the provider** (your data flows through them);
- it therefore **does not work for DeepSeek or any OpenAI-compatible Chat Completions
  backend**, and each provider that _does_ support it (OpenAI vs Anthropic) uses a
  different shape.

mozaik is multi-provider (Anthropic / OpenAI / OpenAI-compatible / DeepSeek / Gemini). The
only way to offer MCP **uniformly across all of them** — and keep the tool loop and the MCP
server's credentials/data **in our process** — is an in-process client. That's this module.

## The two approaches

|                                                            | **In-process client (this PR)**                  | **Provider-native MCP tool**       |
| ---------------------------------------------------------- | ------------------------------------------------ | ---------------------------------- |
| Code                                                       | a small MCP client + registry in the infra layer | almost none — pass a tool ref      |
| Works on OpenAI (Responses)                                | ✅                                               | ✅                                 |
| Works on Anthropic                                         | ✅                                               | ⚠️ different shape, beta connector |
| Works on **DeepSeek / OpenAI-compatible Chat Completions** | ✅                                               | ❌ **no native MCP at all**        |
| Works on Gemini                                            | ✅                                               | ❌                                 |
| Where the tool loop runs                                   | our process                                      | the LLM provider's servers         |
| MCP server data / credentials                              | stay with us                                     | flow through the provider          |
| Per-provider code                                          | none (one path)                                  | one shape per provider             |

Source (OpenAI's own docs): the remote MCP tool is documented only for the Responses API
and only for OpenAI models (gpt-5.x); the provider's orchestration connects to the MCP
server. There is no Chat Completions / non-OpenAI path, so DeepSeek can't use it.

## How it works

MCP tools are exposed as **ordinary `FunctionTool`s** — no new tool type, no changes to any
provider mapper or to the function-call loop.

```ts
const registry = new McpToolRegistry([{ url: "https://api.githubcopilot.com/mcp/", authToken: githubToken }])
const mcpTools = await registry.discoverTools() // FunctionTool[]
```

- `McpClient` (Streamable HTTP transport, Bearer auth) connects, lists tools, and calls them.
- `McpToolRegistry` turns each MCP tool into a `FunctionTool` whose `parameters` is the
  tool's JSON-Schema `inputSchema` and whose `invoke()` proxies the call back to the server.

## How an agent gets these tools

The same way it gets any tool — they go in `InferenceRequest.tools`:

```ts
await runInference.execute({
	model,
	context,
	caller,
	environment,
	tools: [...localTools, ...mcpTools], // MCP tools are just FunctionTools
})
```

The model calls a tool by name → the existing `FunctionCallRunner` calls `tool.invoke(args)`
→ for an MCP tool that proxies to the MCP server → the result flows back through the normal
function-call loop. **Nothing in the agent/loop is MCP-aware.**

## Why the client lives in the infrastructure layer

Per `CONTRIBUTING.md`, external API clients and network integrations belong in
infrastructure (the domain may not do network I/O). The MCP client talks to a remote server
over HTTP, so it sits in `infrastructure/mcp/` alongside the provider adapters — same as the
Anthropic/OpenAI clients.

## Scope of this PR vs. follow-ups

- **This PR:** the capability — `McpClient`, `McpToolRegistry`, exports, unit tests.
- **Consumer wiring (separate):** pointing the registry at a specific server (e.g. GitHub's
  with a user token) and merging the discovered tools into a participant's tool list. That's
  a caller concern, not part of the core capability.
- **Possible future optimization (hybrid):** for providers that _do_ support native MCP
  (OpenAI Responses, Anthropic), add a native passthrough so the loop runs provider-side,
  and keep this in-process client as the fallback for DeepSeek / OpenAI-compatible / Gemini.
  Native-where-available + in-process-everywhere-else — additive, no redesign.

## Testing

`tests/infrastructure/mcp/mcp-tool-registry.test.ts` covers the registry mapping and the
`invoke → callTool` routing via an injected fake client. An end-to-end test that runs a
discovered MCP tool through the real function-call loop is a sensible add (the path is the
ordinary `FunctionTool` path, so it exercises no new loop code).
