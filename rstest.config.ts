import { defineConfig } from "@rstest/core"

export default defineConfig({
	// Run in Node — Mozaik is a server-side agent framework, not a browser library.
	testEnvironment: "node",
	// Discover unit and integration suites under tests/.
	include: ["tests/**/*.{test,spec}.ts"],
	// Seed dummy provider credentials before any suite runs.
	setupFiles: ["./tests/setup.ts"],
	// Read the project's path aliases (@app, @domain, @infra) from tsconfig.
	source: {
		tsconfigPath: "./tsconfig.json",
	},
	// Resolve the same aliases explicitly so tests import internal modules the
	// way the source does, regardless of tsconfig auto-detection.
	resolve: {
		alias: {
			"@agent": "./src/agent",
			"@environment": "./src/environment",
			"@inference": "./src/inference",
			"@providers": "./src/providers",
			"@util": "./src/util",
		},
	},
	// Coverage is opt-in via the --coverage flag (npm run test:coverage).
	// These settings shape the report when it runs.
	coverage: {
		provider: "istanbul",
		// Measure the framework source across all three layers.
		include: ["src/**/*.ts"],
		// index.ts is a re-export barrel with no executable logic.
		exclude: ["src/index.ts"],
		reporters: ["text", "html", "lcov"],
		reportsDirectory: "./coverage",
	},
})
