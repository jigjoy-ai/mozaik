import {describe,it,expect} from 'vitest';
import {z} from 'zod';
import {jsonSnapshot, requestSchema} from '../src/core.js';
export const request = {requestId:'r',sessionId:'s',cycleId:'c',generation:0,stateVersion:0,state:{},candidates:[{id:'a',producerId:'A',label:'A',proposal:{}}]};
describe('requests',()=>{
  const schema = requestSchema(z.object({}),z.object({}));
  it('accepts typed requests',()=>expect(schema.parse(request)).toEqual(request));
  it.each([{candidates:[]},{candidates:[request.candidates[0],request.candidates[0]]}])('rejects empty or duplicate candidates',({candidates})=>expect(()=>schema.parse({...request,candidates})).toThrow());
  it.each([NaN,undefined,()=>{},new Date()])('rejects non JSON state',state=>expect(()=>jsonSnapshot({state})).toThrow());
  it('rejects cycles',()=>{const v:unknown[]=[];v.push(v);expect(()=>jsonSnapshot(v)).toThrow();});
});
