import assert from 'node:assert/strict';
import { createHuman, defineRuntime, RuntimeState, SemanticEvent, SituationSpecification, type SituationContext } from '@mozaik-ai/core';
const runtime = defineRuntime();
class State extends RuntimeState {}
runtime.initializeRuntime({ state: new State() });
class Requested extends SituationSpecification {
  isSatisfiedBy({event}: SituationContext) { return event.type === 'jev.v1.arbitration.requested'; }
}
let finish!: () => void;
const done = new Promise<void>(resolve => { finish = resolve; });
let dispatched = false;
const observer = createHuman({name:'spike', capabilities:[], handlers:[{
  specification:new Requested(),
  processor:{ apply() {
    void (async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      assert(dispatched, 'Dispatcher must return before async arbitration completes');
      runtime.sendEvent(SemanticEvent.create('jev.v1.arbitration.completed', observer.getId(), {selectedCandidateId:'a'}), observer.getId());
      finish();
    })().catch(error => { console.error(error); process.exitCode = 1; finish(); });
  }}
}]});
runtime.join(observer);
runtime.sendEvent(SemanticEvent.create('jev.v1.arbitration.requested', observer.getId(), {}), observer.getId());
dispatched = true;
await done;
runtime.leave(observer);
console.log('Public API asynchronous arbitration spike passed');
