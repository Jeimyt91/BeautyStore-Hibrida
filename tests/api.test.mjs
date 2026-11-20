import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import {join} from 'node:path';
import {createServer} from '../server/index.mjs';

test('API REST responde GET, POST, PUT y DELETE',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'beauty-api-'));
 const server=createServer(join(folder,'products.json'));
 await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}`;
 const request=(path,method='GET',data)=>fetch(url+path,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 try{
  const health=await request('/api/health');assert.equal(health.status,200);
  const initial=await (await request('/api/products')).json();assert.equal(initial.length,4);
  const created=await (await request('/api/products','POST',{nombre:'Masaje',precio:55000,imagen:'/images/logo.png'})).json();assert.equal(created.nombre,'Masaje');
  const updated=await (await request(`/api/products/${created.id}`,'PUT',{nombre:'Masaje relajante',precio:59000,imagen:'/images/logo.png'})).json();assert.equal(updated.precio,59000);
  const deleted=await request(`/api/products/${created.id}`,'DELETE');assert.equal(deleted.status,200);
  const invalid=await request('/api/products','POST',{nombre:'X',precio:-10});assert.equal(invalid.status,400);
  const all=await (await request('/api/products')).json();assert.equal(all.length,4);
 }finally{await new Promise((resolve)=>server.close(resolve));await rm(folder,{recursive:true,force:true});}
});
