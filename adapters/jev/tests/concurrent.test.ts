import {it,expect} from 'vitest';
import {concurrentDemo} from '../examples/concurrent.js';
it('runs overlapping Mozaik agent loops and waits for both proposals',async()=>{
 const demo=await concurrentDemo();
 expect(demo.proposals).toHaveLength(2);
 expect(demo.observed.filter(t=>t.endsWith('.completed'))).toHaveLength(1);
});
