/* Composition-only renderer for a browser without WebGL. Uses the real scene,
   geometry and camera; it does not validate GPU materials, lighting or shadows. */
(function(){
  const T=window.THREE;
  T.WebGLRenderer=function({canvas}){
    const ctx=canvas.getContext('2d'),textures=new WeakMap();let width=1,height=1,last=0;
    this.shadowMap={};this.setPixelRatio=function(){};
    this.setSize=function(w,h){width=canvas.width=w;height=canvas.height=h;};
    function pixel(tex,u,v){
      if(!tex||!tex.image)return [255,255,255,255];
      let image=textures.get(tex);
      if(!image){try{const c=document.createElement('canvas');c.width=tex.image.width;c.height=tex.image.height;const x=c.getContext('2d');x.drawImage(tex.image,0,0);image={data:x.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height};textures.set(tex,image);}catch(e){return [255,255,255,255];}}
      u=((u%1)+1)%1;v=((v%1)+1)%1;if(tex.flipY)v=1-v;
      const at=(Math.min(image.h-1,Math.floor(v*image.h))*image.w+Math.min(image.w-1,Math.floor(u*image.w)))*4;
      return image.data.slice(at,at+4);
    }
    function clip(poly){
      const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=a.z<=-.06,next=b.z<=-.06;if(inside)out.push(a);if(inside!==next){const t=(-.06-a.z)/(b.z-a.z);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:-.06,u:a.u+(b.u-a.u)*t,v:a.v+(b.v-a.v)*t});}}return out;
    }
    this.render=function(scene,camera){
      const now=performance.now();if(now-last<400)return;last=now;
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
      const faces=[],p=new T.Vector3(),mv=new T.Matrix4(),pm=camera.projectionMatrix.elements;
      scene.traverseVisible(mesh=>{
        if(!mesh.isMesh||!mesh.geometry||mesh.userData.hot)return;
        const g=mesh.geometry,pos=g.attributes.position,uv=g.attributes.uv;if(!pos)return;
        if(mesh.isSkinnedMesh)mesh.skeleton.update();
        mv.multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);
        const points=new Array(pos.count);for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i);if(mesh.isSkinnedMesh)mesh.boneTransform(i,p);p.applyMatrix4(mv);points[i]={x:p.x,y:p.y,z:p.z,u:uv?uv.getX(i):0,v:uv?uv.getY(i):0};}
        const index=g.index,count=index?index.count:pos.count,groups=Array.isArray(mesh.material)?g.groups:[{start:0,count:count,materialIndex:0}];
        for(const group of groups){const m=Array.isArray(mesh.material)?mesh.material[group.materialIndex]:mesh.material;if(!m||m.visible===false||m.opacity<.05)continue;
          for(let i=group.start;i<Math.min(count,group.start+group.count);i+=3){
            const a=points[index?index.getX(i):i],b=points[index?index.getX(i+1):i+1],c=points[index?index.getX(i+2):i+2];if(!c)continue;
            const nx=(b.y-a.y)*(c.z-a.z)-(b.z-a.z)*(c.y-a.y),ny=(b.z-a.z)*(c.x-a.x)-(b.x-a.x)*(c.z-a.z),nz=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
            if(m.side!==T.DoubleSide&&nx*a.x+ny*a.y+nz*a.z>=0)continue;
            const poly=clip([a,b,c]);if(poly.length<3)continue;
            const xy=poly.map(v=>[(v.x*pm[0]/-v.z*.5+.5)*width,(-v.y*pm[5]/-v.z*.5+.5)*height]);
            if(xy.every(v=>v[0]<0)||xy.every(v=>v[0]>width)||xy.every(v=>v[1]<0)||xy.every(v=>v[1]>height))continue;
            const rgba=pixel(m.map,(a.u+b.u+c.u)/3,(a.v+b.v+c.v)/3);if(rgba[3]<90)continue;
            const len=Math.hypot(nx,ny,nz)||1,shade=m.isMeshBasicMaterial?1:.68+.28*Math.max(0,(ny*.8+nz*.6)/len);
            const co=m.color||{r:1,g:1,b:1};const rgb=[rgba[0]*co.r,rgba[1]*co.g,rgba[2]*co.b].map(v=>Math.min(255,Math.round(v*shade)));
            faces.push({xy,depth:-(a.z+b.z+c.z)/3,fill:'rgb('+rgb.join(',')+')'});
          }
        }
      });
      ctx.fillStyle='#343b32';ctx.fillRect(0,0,width,height);faces.sort((a,b)=>b.depth-a.depth);
      for(const f of faces){ctx.beginPath();ctx.moveTo(...f.xy[0]);for(let i=1;i<f.xy.length;i++)ctx.lineTo(...f.xy[i]);ctx.closePath();ctx.fillStyle=f.fill;ctx.fill();}
      canvas.dataset.composition='ready';
    };
  };
})();
