import { Tool } from "@inference/tool"
import { ParticipantManifest } from "@environment/participant"
import { Memory } from "./memory"
import { SituationHandler } from "@environment/situation-handler"
import { LoopController } from "./loop/controller"

export type AgentRecord = {
	id: string
	manifest: ParticipantManifest
	tools: Tool[]
	memory: Memory
	handlers: SituationHandler[]
	loopControllers?: Map<string, LoopController>
}
