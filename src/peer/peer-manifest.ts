import { DirectiveContract } from "./directive-contract"

export interface PeerManifest {
	id: string
	name: string
	directives: DirectiveContract[]
}
