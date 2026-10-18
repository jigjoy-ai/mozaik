import { Contract } from "./contract"

export interface PeerManifest {
	id: string
	name: string
	contracts: Contract[]
}
