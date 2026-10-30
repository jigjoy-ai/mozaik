import assert from 'node:assert/strict';
import {z} from 'zod';
import {createAgent,createHuman,defineRuntime,RuntimeState,SemanticEvent,SituationSpecification,ModelMessageItem,type SituationContext,type InferenceRunner} from '@mozaik-ai/core';
import {createJevBridge,events,MockJevAdapter,type ArbitrationCandidate} from '../src/index.js';

/** Two real runLoop calls share a deterministic runner; no credentials or inference API. */
export async function concurrentDemo() {
 class State extends RuntimeState {}
 const intervals:{start:number;end:number}[]=[];
 let release!:()=>void;
 const barrier=new Promise<void>(resolve=>{release=resolve;});
 const runner:InferenceRunner={
  async run(){
   const i=intervals.length, interval={start:performance.now(),end:0};intervals.push(interval);
   if(intervals.length===2) release();
   await barrier;
   await new Promise(r=>setTimeout(r,10));
   interval.end=performance.now();
   return {items:[ModelMessageItem.rehydrate({text:JSON.stringify({action:i===0?'fast':'thorough'})})],tokenUsage:undefined,rowResponse:null};
  },
  async *stream(){throw Error('streaming not used');},
 };
 const runtime=defineRuntime<State>();runtime.initializeRuntime({state:new State(),inferenceRunnerConfig:{runner}});
 const proposals:ArbitrationCandidate<{action:string}>[]=[];
 const observed:string[]=[];
 let resolve!:()=>void;
 const completed=new Promise<void>(r=>{resolve=r;});
 class Observe extends SituationSpecification {isSatisfiedBy({event}:SituationContext){return event.type==='model.answer'||event.type.startsWith('jev.v1.');}}
 const participant=createHuman({name:'coordinator',capabilities:[],handlers:[]});
 const schemas={stateSchema:z.object({objective:z.string()}),proposalSchema:z.object({action:z.string()})};
 const bridge=createJevBridge({...schemas,provider:new MockJevAdapter({...schemas,fixture:'agent-a'}),runtime,participantId:participant.getId(),isCurrent:r=>r.generation===0&&r.stateVersion===1});
 participant.setHandlers([bridge.handler,{specification:new Observe(),processor:{apply({event}){
  observed.push(event.type);
  if(event.type==='model.answer'){
   const answer=event.payload as {answer:ModelMessageItem};
   proposals.push({id:event.producerId,producerId:event.producerId,label:'Proposal '+proposals.length,proposal:schemas.proposalSchema.parse(JSON.parse(answer.answer.content.text))});
   if(proposals.length===2) runtime.sendEvent(SemanticEvent.create(events.requested,participant.getId(),{requestId:'concurrent',sessionId:'demo',cycleId:'1',generation:0,stateVersion:1,state:{objective:'Choose a response style'},candidates:proposals}),participant.getId());
  }
  if(event.type===events.completed) resolve();
 }}}]);
 runtime.join(participant);
 const agents=['A','B'].map(name=>createAgent({name,capabilities:[],instruction:'Propose a response style',tools:[],handlers:[]}));
 agents.forEach(a=>runtime.join(a));
 agents.forEach(a=>runtime.runLoop(a.getId(),'Propose',{model:'deterministic',context:a.getMemory().getContext(),tools:[]}));
 let timer:ReturnType<typeof setTimeout>|undefined;
 try {
  await Promise.race([completed,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Demo deadline exceeded')),2000);})]);
  assert(intervals.length===2 && intervals[0].start<intervals[1].end && intervals[1].start<intervals[0].end,'Agent executions must overlap');
  assert(observed.indexOf(events.started)>observed.lastIndexOf('model.answer'),'Wait for both proposals');
  return {intervals,proposals,observed};
 } finally {
  clearTimeout(timer);bridge.dispose();agents.forEach(a=>runtime.leave(a));runtime.leave(participant);
 }
}
if(process.argv[1]?.endsWith('concurrent.ts')) console.log(await concurrentDemo());
