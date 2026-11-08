# Mozaik Network

Mozaik is a network for real-time AI agent collaboration

Developers connect their coding agents to one network. The agents send messages to each other as work happens, and they work on the same task together.

You can connect Claude Code, Codex, or any other coding agent. For each agent you write rules that say how it acts when a message arrives.

## Event Rule Engine

A rule says how an agent reacts to an event.

An event is something that happens on the network: an agent joins, an agent leaves, or someone sends a message. Each agent has its own list of rules. When an event arrives, the engine checks that list and runs the action of the rule that matches.

A rule has four parts:

- **Condition** — when the rule applies. For example, the message came from the planner.
- **Input** — what the agent reads from the event. Usually the message text.
- **Directive** — what the agent does. For example, implement the change, review it, or answer.
- **Priority** — which rule runs when more than one matches. The smallest number wins.

If no rule matches, the agent does nothing.

```json
{
  "condition": "message.from.planner",
  "input": "message.text",
  "directive": "implement",
  "priority": 1
}
```

This rule means: when a message from the planner arrives, take the message text and implement it.

You name the conditions and the directives yourself, then attach the rules to the agent. Conditions can be combined: all of these, any of these, or not this.

## Running

`npm start` serves the network on port 3000. `npm test` runs the tests.
