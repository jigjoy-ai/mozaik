# Contributing

Use Node 22+ and run npm ci --workspaces=false in adapters/jev. Run npm run check
and npm run verify:package before submitting changes. Tests must remain offline;
inject the SDK client/fetch for provider scenarios. Add tests for lifecycle and
security boundary changes. Preserve upstream license notices.

Do not modify Mozaik core to add provider-specific behavior. Discuss any missing
public extension point and update the architecture decision first. Keep public
types, runtime validation, README and event version semantics aligned.

Never commit credentials, generated dist artifacts, or consumer node_modules.
npm pack creates a local review artifact; publishing and pushing require explicit
authorization. The package name is provisional until npm availability is checked.
