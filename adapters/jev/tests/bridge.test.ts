import {it,expect,vi} from 'vitest';
import {z} from 'zod';
import {SemanticEvent,createHuman,defineRuntime,RuntimeState} from '@mozaik-ai/core';
import {createJevBridge,events,eventPayloadSchema} from '../src/bridge.js';
import {MockJevAdapter} from '../src/providers.js';
import {request} from './fixture.js';
const schemas={stateSchema:z.object({}),proposalSchema:z.object({})};
function setup(extra:Partial<Parameters<typeof createJevBridge<object,object>>[0]>={}) {
 const sent:SemanticEvent[]=[];
 const bridge=createJevBridge({...schemas,provider:new MockJevAdapter({...schemas,latencyMs:10}),runtime:{sendEvent:e=>{sent.push(e);}},participantId:'bridge',isCurrent:()=>true,...extra});
 return {bridge,sent};
}
it('emits validated correlated events and suppresses duplicate requests',async()=>{
 const {bridge,sent}=setup();
 await Promise.all([bridge.submit(request),bridge.submit(request)]);
 await bridge.submit(request);
 expect(sent.map(e=>e.type)).toEqual([events.started,events.completed]);
 sent.forEach(e=>expect(eventPayloadSchema.parse(e.payload).requestId).toBe('r'));
 expect(bridge.pendingCount).toBe(0);
});
it('discards generation changes with no actionable result',async()=>{
 let generation=0;
 const {bridge,sent}=setup({isCurrent:r=>r.generation===generation});
 const task=bridge.submit(request);generation++;await task;
 expect(sent.at(-1)?.type).toBe(events.discarded);
 expect(sent.at(-1)?.payload).not.toHaveProperty('result');
});
it('isolates sessions and bounds concurrency',async()=>{
 const {bridge,sent}=setup({maxConcurrent:2});
 await Promise.all(['one','two','three'].map(sessionId=>bridge.submit({...request,sessionId})));
 expect(sent.filter(e=>e.type===events.completed)).toHaveLength(2);
 expect(sent.filter(e=>e.type===events.discarded)).toHaveLength(1);
});
it('prevents processing after disposal and drops in-flight results',async()=>{
 const {bridge,sent}=setup();
 const task=bridge.submit(request);bridge.dispose();await task;await bridge.submit({...request,requestId:'other'});
 expect(sent.map(e=>e.type)).toEqual([events.started]);
});
it('contains provider rejection and publication errors',async()=>{
 const onDiagnostic=vi.fn();
 const {bridge,sent}=setup({provider:{arbitrate:async()=>{throw Error('secret');}}});
 await bridge.submit(request);
 expect(sent.at(-1)?.type).toBe(events.failed);
 const bad=setup({runtime:{sendEvent(){throw Error('unjoined');}},onDiagnostic});
 await expect(bad.bridge.submit(request)).resolves.toBeUndefined();
 expect(onDiagnostic).toHaveBeenCalledWith('publication_failed');
});
it('retains capacity for a provider ignoring cancellation',async()=>{
 let finish!:(r:Awaited<ReturnType<MockJevAdapter<object,object>['arbitrate']>>)=>void;
 const {bridge,sent}=setup({maxConcurrent:1,timeoutMs:5,provider:{arbitrate:()=>new Promise(r=>{finish=r;})}});
 await bridge.submit(request);
 expect(bridge.activeCount).toBe(1);
 await bridge.submit({...request,requestId:'r2',cycleId:'c2'});
 expect(sent.at(-1)?.payload).toMatchObject({reason:'capacity'});
 finish(await new MockJevAdapter(schemas).arbitrate(request));
 await new Promise(r=>setTimeout(r,0));
 expect(bridge.activeCount).toBe(0);
 expect(sent.filter(e=>e.type===events.completed)).toHaveLength(0);
});
it('rejects forged provider candidate and correlation',async()=>{
 const result=await new MockJevAdapter(schemas).arbitrate(request);
 const {bridge,sent}=setup({provider:{arbitrate:async()=>({...result,requestId:'forged'})}});
 await bridge.submit(request);
 expect(sent.at(-1)?.payload).toMatchObject({phase:'failed',reason:'invalid_response'});
});
it('integrates with a real initialized runtime, filters completion events',async()=>{
 class State extends RuntimeState{}
 const runtime=defineRuntime();runtime.initializeRuntime({state:new State()});
 const participant=createHuman({name:'bridge',capabilities:[],handlers:[]});
 const provider=new MockJevAdapter(schemas);
 const spy=vi.spyOn(provider,'arbitrate');
 const bridge=createJevBridge({...schemas,provider,runtime,participantId:participant.getId(),isCurrent:()=>true});
 participant.setHandlers([bridge.handler]);runtime.join(participant);
 runtime.sendEvent(SemanticEvent.create(events.requested,participant.getId(),request),participant.getId());
 await new Promise(r=>setTimeout(r,20));
 expect(spy).toHaveBeenCalledTimes(1);
 expect(bridge.pendingCount).toBe(0);
 bridge.dispose();runtime.leave(participant);
});
it('suppresses a second decision in the same cycle',async()=>{
 const {bridge,sent}=setup();await bridge.submit(request);await bridge.submit({...request,requestId:'other'});
 expect(sent.filter(e=>e.type===events.completed)).toHaveLength(1);
 expect(sent.at(-1)?.payload).toMatchObject({reason:'cycle_already_decided'});
});
it('contains malformed request envelopes without unhandled rejection',async()=>{
 const onDiagnostic=vi.fn();const {bridge,sent}=setup({onDiagnostic});
 await bridge.submit(null as unknown as typeof request);
 expect(sent).toHaveLength(0);expect(onDiagnostic).toHaveBeenCalledWith('invalid_envelope');
});
