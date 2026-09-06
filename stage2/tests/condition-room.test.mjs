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
 assert.equal(ready,1);assert.equal(blocks.length,2);scene.updateMatrixWorld(true);
 function target(from,to){const p=new T.Vector3(...from),d=new T.Vector3(...to).sub(p).normalize();const r=new T.Raycaster(p,d,0,2.6);return r.intersectObjects(hits)[0]?.object.userData.id;}
 assert.equal(target([-1.5,1.62,-.1],[-1.4,.69,-1.33]),'escape:cabinet');
 assert.ok(hits.every(h=>!h.userData.id.startsWith('team:')));
 assert.equal(scene.children.filter(x=>x.userData.fixture==='envelopes').length,1);
 assert.equal(target([1.5,1.62,.3],[1.65,.96,-1.01]),'escape:bench');
 assert.equal(target([0,1.62,-1.25],[0,1.62,-4]),undefined);
 const before=scene.children.filter(x=>x.isPointLight).reduce((n,x)=>n+x.intensity,0);
 room.sync({cards:['a','b','c','d'],routes:{a:'bench'},installed:true,run:{},receipt:false,key:false,cabinet:true,plate:true},'approved');room.phase('approved');room.update(1,new T.PerspectiveCamera());
 assert.ok(scene.children.filter(x=>x.isPointLight).reduce((n,x)=>n+x.intensity,0)>before);
 scene.traverse(x=>assert.ok(Number.isFinite(x.position.x)&&Number.isFinite(x.rotation.z)));
});

test('the initial camera frames the first envelope and both work objects without navigation labels',()=>{
 const camera=new T.PerspectiveCamera(62,844/390,.05,80);camera.position.fromArray(ch.spawn.pos);const {yaw,pitch}=ch.spawn;
 camera.lookAt(camera.position.clone().add(new T.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch))));camera.updateMatrixWorld();
 for(const point of [[.12,.79,.27],[-1.4,.8,-1.33],[1.65,1,-1.01]]){const p=new T.Vector3(...point).project(camera);assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1,'object outside opening view');}
 const source=readFileSync(new URL('../condition-room.js',import.meta.url),'utf8');assert.doesNotMatch(source,/GLTFLoader|quaternion.copy|function sign/);
});
