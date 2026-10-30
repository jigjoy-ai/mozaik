import { z } from 'zod';
import { TypeSafeClient, choice, AuthenticationError, RateLimitError, APITimeoutError, APIUserAbortError, APIConnectionError, type SystemOneRequest, type RequestOptions } from '@typesafe-ai/sdk';
import { ArbitrationError, correlation, failure, jsonSnapshot, requestSchema, type ArbitrationProvider, type ArbitrationRequest, type ArbitrationOptions, type ArbitrationResult, type ErrorCode } from './core.js';
import { withDeadline } from './timeout.js';

/** Narrow official SDK boundary; unknown responses are validated at runtime. */
export interface JevClient { systemOne(request:SystemOneRequest, options?:RequestOptions):PromiseLike<unknown> }
export interface ProviderConfig<S,P> { stateSchema:z.ZodType<S>; proposalSchema:z.ZodType<P> }
function errorCode(e:unknown):ErrorCode|'timeout' {
  if(e instanceof ArbitrationError) return e.code;
  if(e instanceof AuthenticationError) return 'authentication';
  if(e instanceof RateLimitError) return 'rate_limit';
  if(e instanceof APITimeoutError) return 'timeout';
  if(e instanceof APIUserAbortError) return 'cancelled';
  if(e instanceof APIConnectionError) return 'network';
  return 'provider';
}
const answerSchema = z.object({answers:z.object({decision:z.object({
  type:z.literal('choice'),choice:z.string(),
  confidence:z.number().min(0).max(1).nullish(),
  probabilities:z.record(z.string(),z.number().min(0).max(1)).nullish(),
})})});
export class TypeSafeJevAdapter<S,P> implements ArbitrationProvider<S,P> {
  private readonly client:JevClient;
  constructor(private readonly config:ProviderConfig<S,P> & {client?:JevClient; instructions:string}) {
    if(!config.instructions.trim()) throw new ArbitrationError('invalid_request');
    this.client = config.client ?? new TypeSafeClient({logLevel:'off',retry:{maxRetries:0}});
  }
  async arbitrate(input:ArbitrationRequest<S,P>, options:ArbitrationOptions={}):Promise<ArbitrationResult> {
    const start=performance.now();
    // Correlation must be valid even for failure events; invalid envelopes reject.
    const ids=correlation(input);
    let r:ArbitrationRequest<S,P>;
    try { r=requestSchema(this.config.stateSchema,this.config.proposalSchema).parse(jsonSnapshot(input)); }
    catch { return failure(ids,'jev','invalid_request',start); }
    try {
      return await withDeadline(async signal=>{
        const criteria:Record<string,string> = Object.fromEntries(r.candidates.map((c,i)=>['candidate_'+i,c.label]));
        criteria.abstain='No supplied candidate is appropriate; abstain.';
        const response = await this.client.systemOne({
          state:JSON.stringify({state:r.state,candidates:r.candidates.map((c,i)=>({choice:'candidate_'+i,label:c.label,producerId:c.producerId,proposal:c.proposal}))}),
          questions:{decision:choice(this.config.instructions,criteria)},
        },{signal,timeout:options.timeoutMs??10_000,retry:{maxRetries:0}});
        const parsed=answerSchema.safeParse(response);
        if(!parsed.success) throw new ArbitrationError('invalid_response');
        const a=parsed.data.answers.decision;
        if(!Object.hasOwn(criteria,a.choice)) throw new ArbitrationError('invalid_response');
        if(a.probabilities) {
          if(Object.keys(a.probabilities).length!==Object.keys(criteria).length ||
            Object.keys(criteria).some(k=>!Object.hasOwn(a.probabilities!,k)) ||
            Math.abs(Object.values(a.probabilities).reduce((s,p)=>s+p,0)-1)>0.01)
            throw new ArbitrationError('invalid_response');
        }
        const common={...ids,source:'jev' as const,measurements:'model' as const,latencyMs:performance.now()-start,
          confidence:a.confidence??null,
          probabilities:a.probabilities?Object.fromEntries(r.candidates.map((c,i)=>[c.id,a.probabilities!['candidate_'+i]])):null,
          abstainProbability:a.probabilities?.abstain??null};
        if(a.choice==='abstain') return {...common,status:'abstained',selectedCandidateId:null};
        return {...common,status:'selected',selectedCandidateId:r.candidates[Number(a.choice.slice(10))].id};
      },options);
    } catch(e) { return failure(ids,'jev',errorCode(e),start); }
  }
}
export const mockFixtures = ['agent-a','agent-b','abstain','low-confidence','error','timeout','malformed'] as const;
export type MockFixture = typeof mockFixtures[number];
export class MockJevAdapter<S,P> implements ArbitrationProvider<S,P> {
  constructor(private readonly config:ProviderConfig<S,P> & {fixture?:MockFixture;seed?:number;latencyMs?:number}) {}
  async arbitrate(input:ArbitrationRequest<S,P>,options:ArbitrationOptions={}):Promise<ArbitrationResult> {
    const start=performance.now(), ids=correlation(input);
    let r:ArbitrationRequest<S,P>;
    try {r=requestSchema(this.config.stateSchema,this.config.proposalSchema).parse(jsonSnapshot(input));}
    catch {return failure(ids,'mock','invalid_request',start);}
    try {
      return await withDeadline(async signal=>{
        if(this.config.latencyMs) await new Promise<void>((resolve,reject)=>{
          const abort=()=>{clearTimeout(timer);reject(new ArbitrationError('cancelled'));};
          const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},this.config.latencyMs);
          signal.addEventListener('abort',abort,{once:true});
        });
        const f=this.config.fixture;
        if(f==='error') throw new ArbitrationError('provider');
        if(f==='malformed') throw new ArbitrationError('invalid_response');
        if(f==='timeout') throw new ArbitrationError('timeout');
        const index=f==='agent-b'?1:f==='agent-a'||f==='low-confidence'?0:Math.abs(Math.trunc(this.config.seed??0))%r.candidates.length;
        if(f!=='abstain'&&!r.candidates[index]) throw new ArbitrationError('invalid_response');
        const low=f==='low-confidence', abstain=f==='abstain';
        const p=low?1/(r.candidates.length+1):1;
        const common={...ids,source:'mock' as const,measurements:'synthetic' as const,
          latencyMs:performance.now()-start,confidence:low?0:1,
          probabilities:Object.fromEntries(r.candidates.map((c,i)=>[c.id,low?p:!abstain&&i===index?1:0])),
          abstainProbability:low?p:abstain?1:0};
        return abstain?{...common,status:'abstained',selectedCandidateId:null}:{...common,status:'selected',selectedCandidateId:r.candidates[index].id};
      },options);
    } catch(e) {return failure(ids,'mock',errorCode(e),start);}
  }
}
