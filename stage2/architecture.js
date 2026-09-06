/* Distinct architecture for the calculation office and shared test hall. */
(function(global){
  'use strict';
  global.N2Architecture={build:function(o){
    var T=global.THREE,s=o.scene,ch=o.chapter,r=ch.room,hall=r.kind==='test-hall',W=r.W,D=r.D,H=r.H;
    function mat(color,rough){return new T.MeshStandardMaterial({color:color,roughness:rough||.88});}
    var wallMat=mat(hall?0xaab5ae:0xd5c8ac),trim=mat(hall?0x344b4c:0x5c4230),ceiling=mat(hall?0x758682:0xb8a88b);
    function box(w,h,d,m,x,y,z){var q=new T.Mesh(new T.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;s.add(q);return q;}
    function plane(w,h,m,x,y,z,ry,rx){var q=new T.Mesh(new T.PlaneGeometry(w,h),m);q.position.set(x,y,z);q.rotation.set(rx||0,ry||0,0);q.receiveShadow=true;s.add(q);return q;}
    function floorMap(){
      var c=document.createElement('canvas');c.width=c.height=256;var g=c.getContext('2d');
      g.fillStyle=hall?'#7d8882':'#73583e';g.fillRect(0,0,256,256);
      if(hall){g.strokeStyle='#68756f';g.lineWidth=2;g.strokeRect(0,0,256,256);for(var i=0;i<90;i++){g.fillStyle=i%2?'#78857d':'#818c83';g.fillRect((i*61)%256,(i*43)%256,2,1);}}
      else{for(var row=0;row<8;row++){g.fillStyle=['#705539','#796046','#82694d','#6e5338'][row%4];g.fillRect(0,row*32,256,31);g.fillStyle='#493d2b';g.fillRect((row%3)*84,row*32,1,32);for(var k=0;k<4;k++){g.fillStyle='#69513a';g.fillRect((k*53+row*17)%256,row*32+5+k*6,70,1);}}}
      var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(hall?W/2:W/2,hall?D/2:D/2);t.encoding=T.sRGBEncoding;return t;
    }
    var fm=mat(0xffffff);fm.map=floorMap();plane(W,D,fm,0,0,0,0,-Math.PI/2);plane(W,D,ceiling,0,H,0,0,Math.PI/2);
    // The exit is an actual opening in the far wall.
    var door=ch.door,left=door.pos[0]-door.width/2,right=door.pos[0]+door.width/2;
    plane(left+W/2,H,wallMat,(-W/2+left)/2,H/2,-D/2);
    plane(W/2-right,H,wallMat,(right+W/2)/2,H/2,-D/2);
    plane(door.width,H-door.height,wallMat,door.pos[0],door.height+(H-door.height)/2,-D/2);
    plane(W,H,wallMat,0,H/2,D/2,Math.PI);plane(D,H,wallMat,-W/2,H/2,0,Math.PI/2);plane(D,H,wallMat,W/2,H/2,0,-Math.PI/2);
    function windowPanel(x,z,w,h,y,ry){
      var group=new T.Group();group.position.set(x,y,z);group.rotation.y=ry;s.add(group);
      var glass=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({color:hall?0xb2d0d0:0xe9d9b1,emissive:hall?0x718d91:0xbaab85,emissiveIntensity:.42,roughness:.4}));group.add(glass);
      function bar(bw,bh,bx,by){var m=new T.Mesh(new T.BoxGeometry(bw,bh,.055),trim);m.position.set(bx,by,.03);group.add(m);}
      bar(w+.12,.07,0,h/2);bar(w+.12,.07,0,-h/2);bar(.07,h,-w/2,0);bar(.07,h,w/2,0);bar(w,.045,0,0);
      for(var j=-1;j<=1;j++)bar(.035,h,j*w/4,0);
    }
    if(hall){
      // High glazing, steel columns and roof trusses give the hall a different section.
      for(var z=-3.5;z<=3.5;z+=3.5){windowPanel(-W/2+.03,z,2.7,1.15,2.9,Math.PI/2);box(.19,H,.22,trim,-W/2+.13,H/2,z+1.6);box(.19,H,.22,trim,W/2-.13,H/2,z+1.6);}
      windowPanel(-1.7,-D/2+.03,4.8,1.05,3.1,0);
      for(var z=-3.2;z<=3.2;z+=3.2){
        box(W,.13,.17,trim,0,H-.65,z);box(W,.12,.17,trim,0,H-.12,z);
        for(var x=-W/2+.7;x<W/2-.4;x+=1.3){var brace=box(1.38,.055,.08,trim,x,H-.385,z);brace.rotation.z=(Math.round((x+W/2)/1.3)%2?1:-1)*.38;}
      }
      var lane=mat(0xb6a56e);[-1.55,1.55].forEach(function(x){box(.045,.004,5.7,lane,x,.003,-.75);});
      // A deep skirting and a horizontal service conduit stay fixed to the wall.
      box(W,.25,.07,trim,0,.125,-D/2+.04);box(.055,.055,D-.3,trim,W/2-.12,1.45,0);
    }else{
      windowPanel(W/2-.03,-.65,3.4,1.65,2.03,-Math.PI/2);
      windowPanel(-2.4,-D/2+.03,1.3,1.65,2.03,0);
      for(var z=-D/2+.7;z<D/2;z+=1.4){box(.09,H,.065,trim,-W/2+.03,H/2,z);}
      box(.12,.19,D,trim,-W/2+.04,.095,0);box(.12,.19,D,trim,W/2-.04,.095,0);
      box(W,.12,.14,trim,0,H-.08,-D/2+.05);box(W,.12,.14,trim,0,H-.08,D/2-.05);
    }
    return trim;
  },lights:function(o){
    var T=global.THREE,s=o.scene,hall=o.chapter.room.kind==='test-hall';
    s.add(new T.HemisphereLight(hall?0xd4eced:0xffead0,hall?0x56615b:0x5e4831,hall?.85:.62));
    s.add(new T.AmbientLight(hall?0x8bacae:0x9b8870,.36));
    var sun=new T.DirectionalLight(hall?0xe2f3ef:0xffe0a7,hall?.95:1.35);sun.position.set(hall?-4:4,4,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.far=22;s.add(sun);
    if(hall){[-2.8,2.8].forEach(function(x){var l=new T.PointLight(0xffe6bc,.65,7,2);l.position.set(x,2.9,-2.4);s.add(l);});}
    else{var l=new T.PointLight(0xffd18f,1.2,4,2);l.position.set(.42,1.14,.13);s.add(l);}
  }};
})(window);
