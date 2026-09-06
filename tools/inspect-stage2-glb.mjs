import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url),T=require('../assets/vendor/three.min.js');
T.TextureLoader.prototype.load=function(url,done){const texture=new T.Texture();queueMicrotask(()=>done(texture));return texture;};
vm.runInNewContext(readFileSync(new URL('../assets/vendor/GLTFLoader.js',import.meta.url),'utf8'),{THREE:T,console,TextDecoder,URL,Blob,self:{URL}});
for(const file of process.argv.slice(2)){
 const bytes=readFileSync(file);
 const gltf=await new Promise((resolve,reject)=>new T.GLTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',resolve,reject));
 const root=gltf.scene,clip=gltf.animations.find(c=>/Idle(?:_Neutral)?$/.test(c.name));
 if(clip){const mixer=new T.AnimationMixer(root);mixer.clipAction(clip).play();mixer.update(.1);}
 root.updateMatrixWorld(true);const box=new T.Box3(),v=new T.Vector3();let vertices=0;
 root.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.isSkinnedMesh)mesh.skeleton.update();const p=mesh.geometry.attributes.position;vertices+=p.count;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(mesh.isSkinnedMesh)mesh.boneTransform(i,v);v.applyMatrix4(mesh.matrixWorld);box.expandByPoint(v);}});
 console.log(JSON.stringify({file,size:box.getSize(new T.Vector3()).toArray(),min:box.min.toArray(),max:box.max.toArray(),vertices,animations:gltf.animations.map(c=>c.name)}));
}
