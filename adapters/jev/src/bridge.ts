import {SemanticEvent, SituationSpecification, type SituationContext, type SituationHandler} from '@mozaik-ai/core';
import {z} from 'zod';
import {ArbitrationError, correlation, correlationSchema, jsonSnapshot, requestSchema, resultSchema, validateResult, type ArbitrationProvider, type ArbitrationRequest, type ArbitrationResult, type Correlation} from './core.js';
import {withDeadline} from './timeout.js';
import type {ProviderConfig} from './providers.js';

export const events = Object.freeze(Object.fromEntries(['requested','started','completed','abstained','failed','timed_out','discarded'].map(k=>[k,'jev.v1.arbitration.'+k]))) as Readonly<Record<'requested'|'started'|'completed'|'abstained'|'failed'|'timed_out'|'discarded',string>>;
export const eventPayloadSchema = correlationSchema.extend({version:z.literal(1),phase:z.enum(['started','completed','abstained','failed','timed_out','discarded']),result:resultSchema.optional(),reason:z.string().optional()});
export class JevSituationSpecification extends SituationSpecification {
  isSatisfiedBy({event}:SituationContext):boolean { return event.type===events.requested; }
}
export interface BridgeConfig<S,P> extends ProviderConfig<S,P> {
  provider:ArbitrationProvider<S,P>;
  runtime:{sendEvent(event:SemanticEvent,senderId:string):void};
  participantId:string;
  /** Must synchronously verify session, generation, cycle and state version. */
  isCurrent(request:Correlation):boolean;
  maxConcurrent?:number;
  timeoutMs?:number;
  dedupeSize?:number;
  dedupeTtlMs?:number;
  /** Receives only safe codes, never SDK errors or request contents. Must not throw. */
  onDiagnostic?:(code:string)=>void;
}
export function createJevBridge<S,P>(config:BridgeConfig<S,P>) {
  const max=config.maxConcurrent??8, size=config.dedupeSize??1024, ttl=config.dedupeTtlMs??60_000, timeout=config.timeoutMs??10_000;
  for(const n of [max,size,ttl,timeout]) if(!Number.isSafeInteger(n)||n<=0) throw new ArbitrationError('invalid_request');
  if(timeout>2_147_483_647) throw new ArbitrationError('invalid_request');
  let disposed=false, running=0;
  const pending=new Map<string,AbortController>(), cycles=new Set<string>(), recent=new Map<string,number>();
  const schema=requestSchema(config.stateSchema,config.proposalSchema);
  function diagnostic(code:string) {try{config.onDiagnostic?.(code);}catch{/* diagnostic callbacks cannot break dispatch */}}
  function current(r:Correlation) {try{return config.isCurrent(r);}catch{diagnostic('freshness_check_failed');return false;}}
  function emit(phase:z.infer<typeof eventPayloadSchema>['phase'],r:Correlation,result?:ArbitrationResult,reason?:string) {
    if(disposed) return;
    const payload=eventPayloadSchema.parse({...correlation(r),version:1,phase,...(result?{result}:{}),...(reason?{reason}:{})});
    try {config.runtime.sendEvent(SemanticEvent.create(events[phase],config.participantId,payload),config.participantId);}
    catch {diagnostic('publication_failed');}
  }
  function remember(key:string) {
    const now=Date.now();
    for(const [k,t] of recent) if(now-t>=ttl) recent.delete(k);
    if(recent.has(key)) return false;
    recent.set(key,now);
    while(recent.size>size) recent.delete(recent.keys().next().value!);
    return true;
  }
  async function submit(input:ArbitrationRequest<S,P>):Promise<void> {
    if(disposed) return;
    let ids:Correlation;
    try {ids=correlation(input);}catch{diagnostic('invalid_envelope');return;}
    const key='request:'+JSON.stringify([ids.sessionId,ids.requestId]);
    if(pending.has(key)||!remember(key)) return;
    let r:ArbitrationRequest<S,P>;
    try{r=schema.parse(jsonSnapshot(input));}
    catch{emit('failed',ids,undefined,'invalid_request');return;}
    // Source on bridge-generated failures is omitted by using discarded events.
    const cycle=JSON.stringify([r.sessionId,r.generation,r.cycleId]);
    if(!current(r)){emit('discarded',r,undefined,'stale');return;}
    if(cycles.has(cycle)){emit('discarded',r,undefined,'cycle_in_flight');return;}
    if(running>=max){emit('discarded',r,undefined,'capacity');return;}
    if(!remember('cycle:'+cycle)){emit('discarded',r,undefined,'cycle_already_decided');return;}
    const controller=new AbortController();
    pending.set(key,controller);cycles.add(cycle);running++;
    emit('started',r);
    let physical:Promise<ArbitrationResult>|undefined;
    try {
      const result=await withDeadline(signal=>{
        physical=Promise.resolve().then(()=>config.provider.arbitrate(r,{signal,timeoutMs:timeout}));
        // A provider ignoring abort still occupies capacity until it settles.
        void physical.then(()=>{running--;},()=>{running--;});
        return physical;
      },{signal:controller.signal,timeoutMs:timeout});
      if(disposed) return;
      if(!current(r)){emit('discarded',r,undefined,'stale');return;}
      let valid:ArbitrationResult;
      try{valid=validateResult(result,r);}catch{emit('failed',r,undefined,'invalid_response');return;}
      const phase={selected:'completed',abstained:'abstained',timeout:'timed_out',error:'failed'} as const;
      emit(phase[valid.status],r,valid);
    } catch(e) {
      if(!disposed) {
        if(!current(r)) emit('discarded',r,undefined,'stale');
        else emit(e instanceof ArbitrationError&&e.code==='timeout'?'timed_out':'failed',r,undefined,e instanceof ArbitrationError?e.code:'provider');
      }
    } finally {
      if(!physical) running--;
      pending.delete(key);cycles.delete(cycle);
    }
  }
  const handler:SituationHandler={specification:new JevSituationSpecification(),processor:{apply({event}){
    // Runtime fan-out is synchronous: attach a rejection handler immediately.
    if(event.type===events.requested) void submit(event.payload as ArbitrationRequest<S,P>).catch(()=>diagnostic('processing_failed'));
  }}};
  return {handler,submit,dispose(){
    disposed=true;
    for(const c of pending.values()) c.abort();
    pending.clear();cycles.clear();recent.clear();
  },get pendingCount(){return pending.size;},get activeCount(){return running;}};
}
