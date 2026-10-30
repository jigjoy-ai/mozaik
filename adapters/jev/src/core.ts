import { z } from 'zod';

const id = z.string().min(1).max(128);
export const correlationSchema = z.object({
  requestId: id, sessionId: id, cycleId: id,
  generation: z.number().int().nonnegative(), stateVersion: z.number().int().nonnegative(),
});
export function requestSchema<S, P>(state: z.ZodType<S>, proposal: z.ZodType<P>) {
  return correlationSchema.extend({
    state,
    candidates: z.array(z.object({id, producerId:id, label:z.string().min(1).max(512), proposal})).min(1).max(100),
  }).superRefine((r, ctx) => {
    if (new Set(r.candidates.map(c => c.id)).size !== r.candidates.length)
      ctx.addIssue({code:'custom', message:'Duplicate candidate IDs'});
  });
}
export interface ArbitrationCandidate<P> { id:string; producerId:string; label:string; proposal:P }
export type Correlation = z.infer<typeof correlationSchema>;
export interface ArbitrationRequest<S, P> extends Correlation { state:S; candidates:ArbitrationCandidate<P>[] }
export interface ArbitrationOptions { signal?:AbortSignal; timeoutMs?:number }
export type ErrorCode = 'invalid_request'|'invalid_response'|'authentication'|'rate_limit'|'network'|'provider'|'cancelled'|'capacity';
const baseResult = correlationSchema.extend({
  source:z.enum(['jev','mock']), measurements:z.enum(['model','synthetic','none']),
  latencyMs:z.number().finite().nonnegative(),
  confidence:z.number().min(0).max(1).nullable(),
  probabilities:z.record(z.string(),z.number().min(0).max(1)).nullable(),
  abstainProbability:z.number().min(0).max(1).nullable(),
});
export const resultSchema = z.discriminatedUnion('status', [
  baseResult.extend({status:z.literal('selected'), selectedCandidateId:id}),
  baseResult.extend({status:z.literal('abstained'), selectedCandidateId:z.null()}),
  baseResult.extend({status:z.literal('timeout'), selectedCandidateId:z.null()}),
  baseResult.extend({status:z.literal('error'), selectedCandidateId:z.null(), errorCode:z.enum(['invalid_request','invalid_response','authentication','rate_limit','network','provider','cancelled','capacity'])}),
]);
export type ArbitrationResult = z.infer<typeof resultSchema>;
export interface ArbitrationProvider<S,P> {
  arbitrate(request:ArbitrationRequest<S,P>, options?:ArbitrationOptions):Promise<ArbitrationResult>;
}
export class ArbitrationError extends Error {
  constructor(public readonly code:ErrorCode|'timeout') { super(code); }
}
export function correlation(r:Correlation):Correlation {
  return correlationSchema.parse(r);
}
export function failure(r:Correlation, source:'jev'|'mock', code:ErrorCode|'timeout', start:number):ArbitrationResult {
  const base = {...correlation(r), source, measurements:'none' as const, latencyMs:Math.max(0,performance.now()-start), confidence:null, probabilities:null, abstainProbability:null, selectedCandidateId:null};
  return code === 'timeout' ? {...base,status:'timeout'} : {...base,status:'error',errorCode:code};
}
/** Reject non-JSON values, cycles, and excessive depth/size before SDK serialization. */
export function jsonSnapshot<T>(value:T):T {
  const seen = new Set<object>();
  function check(v:unknown, depth:number):void {
    if(depth>64) throw new ArbitrationError('invalid_request');
    if(v === null || typeof v === 'string' || typeof v === 'boolean') return;
    if(typeof v === 'number' && Number.isFinite(v)) return;
    if(typeof v !== 'object' || !v || seen.has(v)) throw new ArbitrationError('invalid_request');
    if(!Array.isArray(v) && Object.getPrototypeOf(v)!==Object.prototype && Object.getPrototypeOf(v)!==null) throw new ArbitrationError('invalid_request');
    seen.add(v);
    for(const x of Object.values(v)) check(x,depth+1);
    seen.delete(v);
  }
  check(value,0);
  const text = JSON.stringify(value);
  if(text.length>256_000) throw new ArbitrationError('invalid_request');
  return JSON.parse(text) as T;
}
export function validateResult(result:unknown, r:Correlation & {candidates:{id:string}[]}):ArbitrationResult {
  const v = resultSchema.parse(result);
  for(const key of ['requestId','sessionId','cycleId','generation','stateVersion'] as const)
    if(v[key]!==r[key]) throw new ArbitrationError('invalid_response');
  if(v.status==='selected' && !r.candidates.some(c=>c.id===v.selectedCandidateId)) throw new ArbitrationError('invalid_response');
  if(v.probabilities && Object.keys(v.probabilities).some(k=>!r.candidates.some(c=>c.id===k))) throw new ArbitrationError('invalid_response');
  return v;
}
