import { mkdtempSync, writeFileSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { execFileSync } from "node:child_process"
const dir = mkdtempSync(join(tmpdir(), "jev-consumer-"))
const run = (args, cwd = dir) => execFileSync("npm", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
const packed = JSON.parse(
	run(["pack", "--workspaces=false", "--ignore-scripts", "--json", "--pack-destination", dir], process.cwd()),
)[0]
writeFileSync(
	join(dir, "package.json"),
	JSON.stringify({
		private: true,
		type: "module",
		dependencies: {
			"mozaik-jev-adapter": "file:" + join(dir, packed.filename),
			"@mozaik-ai/core": "4.1.0",
			zod: "4.6.7",
			typescript: "5.9.3",
			"@types/node": "22.15.30",
		},
	}),
)
// Reuse the verified lock graph, so CI needs no registry metadata after npm ci.
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"))
const manifest = JSON.parse(readFileSync("package.json", "utf8"))
lock.name = "jev-packed-consumer"
lock.packages[""] = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
lock.packages["node_modules/mozaik-jev-adapter"] = {
	version: manifest.version,
	resolved: "file:" + join(dir, packed.filename),
	integrity: packed.integrity,
	dependencies: manifest.dependencies,
	peerDependencies: manifest.peerDependencies,
	engines: manifest.engines,
}
writeFileSync(join(dir, "package-lock.json"), JSON.stringify(lock))
run(["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"])
writeFileSync(
	join(dir, "consumer.ts"),
	`
import { z } from 'zod';
import { MockJevAdapter, createJevBridge, type ArbitrationResult } from 'mozaik-jev-adapter';
import { TypeSafeJevAdapter } from 'mozaik-jev-adapter/providers';
const provider = new MockJevAdapter({stateSchema:z.object({}),proposalSchema:z.object({})});
const result:ArbitrationResult = await provider.arbitrate({requestId:'r',sessionId:'s',cycleId:'c',generation:0,stateVersion:0,state:{},candidates:[{id:'a',producerId:'p',label:'A',proposal:{}}]});
if(result.status!=='selected'||result.selectedCandidateId!=='a') throw Error('Packed consumer failed');
if(typeof createJevBridge!=='function'||typeof TypeSafeJevAdapter!=='function') throw Error('Missing export');
console.log('Packed ESM import, declarations and offline arbitration passed');
`,
)
execFileSync(
	process.execPath,
	[
		resolve(dir, "node_modules/typescript/bin/tsc"),
		"consumer.ts",
		"--module",
		"NodeNext",
		"--moduleResolution",
		"NodeNext",
		"--target",
		"ES2022",
		"--strict",
		"--skipLibCheck",
	],
	{ cwd: dir, stdio: "inherit" },
)
execFileSync(process.execPath, ["consumer.js"], { cwd: dir, stdio: "inherit" })
console.log("Consumer artifact:", dir)
