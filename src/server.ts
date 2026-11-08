import { createApp } from "src/app"
import { initNetworkModule } from "src/network-module"
import { MozaikCloudAccounts, MozaikCloudMetering } from "@infrastructure/mozaik-cloud-access"

const PORT = Number(process.env.PORT ?? 3000)

// Hosted: MOZAIK_CLOUD_URL (and the service token it trusts) make keys required and messages
// counted against each account. Without it, self-hosted: no keys, nothing counted.
const cloudUrl = process.env.MOZAIK_CLOUD_URL?.replace(/\/+$/, "")
const serviceToken = process.env.NETWORK_SERVICE_TOKEN

if (cloudUrl && !serviceToken) {
	console.error("MOZAIK_CLOUD_URL is set but NETWORK_SERVICE_TOKEN isn't: usage can't be reported")
	process.exit(1)
}

const metering = cloudUrl && serviceToken ? new MozaikCloudMetering(cloudUrl, serviceToken) : undefined

initNetworkModule(cloudUrl ? { accounts: new MozaikCloudAccounts(cloudUrl), metering } : {})

const server = createApp().listen(PORT, () => {
	console.log(`HTTP and WebSocket listening on port ${PORT}${cloudUrl ? `, billing through ${cloudUrl}` : ", self-hosted"}`)
})

// A deploy stops the task with SIGTERM: report what was counted before going.
process.once("SIGTERM", () => {
	server.close()
	void (metering?.flush() ?? Promise.resolve())
		.catch((error) => console.error("Final usage report failed", error))
		.finally(() => process.exit(0))
})
