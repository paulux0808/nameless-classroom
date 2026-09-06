import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url),T=require('../../assets/vendor/three.min.js'),ch=require('../chapters/ch02.js');
test('escape objects can be reached separately and leave the central exit clear',()=>{
 const scene=new T.Scene(),hits=[],blocks=[];let ready=0;
 const ctx={fillRect(){},strokeRect(){},fillText(){}};
 const env={THREE:T,document:{createElement(){return {getContext(){return ctx;}};}}};env.window=env;
 vm.runInNewContext(readFileSync(new URL('../condition-room.js',import.meta.url),'utf8'),env);
 const room=env.N2ConditionRoom.create({chapter:ch,scene,hotspot(pos,size,id){const m=new T.Mesh(new T.BoxGeometry(...size),new T.MeshBasicMaterial());m.position.set(...pos);m.userData.id=id;hits.push(m);scene.add(m);return m;},block(x,z,r){blocks.push({x,z,r});}},()=>ready++);
 assert.equal(ready,1);assert.equal(blocks.length,5);scene.updateMatrixWorld(true);
 function target(from,to){const p=new T.Vector3(...from),d=new T.Vector3(...to).sub(p).normalize();const r=new T.Raycaster(p,d,0,2.6);return r.intersectObjects(hits)[0]?.object.userData.id;}
 assert.equal(target([-1.45,1.62,2.3],[-2.6,.75,2.3]),'escape:cabinet');
 assert.equal(target([1.5,1.62,1.55],[2.7,1.23,1.55]),'escape:plate');
 assert.equal(target([1.4,1.62,1.55],[2.5,.86,1.55]),'escape:bench');
 assert.equal(target([0,1.62,-1.25],[0,1.62,-4]),undefined);
 const before=scene.children.filter(x=>x.isPointLight).reduce((n,x)=>n+x.intensity,0);
 room.sync({installed:true,run:{},receipt:false,key:false,cabinet:true,plate:true},'approved');room.phase('approved');room.update(.016,new T.PerspectiveCamera());
 assert.ok(scene.children.filter(x=>x.isPointLight).reduce((n,x)=>n+x.intensity,0)>before);
 scene.traverse(x=>assert.ok(Number.isFinite(x.position.x)&&Number.isFinite(x.rotation.z)));
});
