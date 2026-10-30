import {describe,it,expect} from 'vitest';
import {z} from 'zod';
import {jsonSnapshot, requestSchema} from '../src/core.js';
import {request} from './fixture.js';
describe('requests',()=>{
  const schema = requestSchema(z.object({}),z.object({}));
  it('accepts typed requests',()=>expect(schema.parse(request)).toEqual(request));
  it.each([{candidates:[]},{candidates:[request.candidates[0],request.candidates[0]]}])('rejects empty or duplicate candidates',({candidates})=>expect(()=>schema.parse({...request,candidates})).toThrow());
  it.each([NaN,undefined,()=>{},new Date()])('rejects non JSON state',state=>expect(()=>jsonSnapshot({state})).toThrow());
  it('rejects cycles',()=>{const v:unknown[]=[];v.push(v);expect(()=>jsonSnapshot(v)).toThrow();});
});
