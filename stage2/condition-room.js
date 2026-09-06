/* CH02 staging. All paper, hardware and light stay attached to the room. */
(function (global) {
  'use strict';
  global.N2ConditionRoom = {
    create: function (o, done) {
      var T=global.THREE, scene=o.scene, spin=0, lastRun=null;
      var metal=new T.MeshStandardMaterial({color:0x46564a,roughness:.8});
      var dark=new T.MeshStandardMaterial({color:0x25362d,roughness:.85});
      var brass=new T.MeshStandardMaterial({color:0xc3a565,metalness:.5,roughness:.42});
      var paperMat=new T.MeshStandardMaterial({color:0xe4dbc0,roughness:1});
      function box(w,h,d,mat,x,y,z,parent){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||scene).add(m);return m;}
      function group(pos){var g=new T.Group();g.position.fromArray(pos);scene.add(g);return g;}
      function localHit(g,pos,size,id,label){var p=new T.Vector3().fromArray(pos).add(g.position);return o.hotspot(p.toArray(),size,id,label);}
      function hardware(g,x,y,z){var h=new T.Group();h.position.set(x,y,z);g.add(h);box(.04,.2,.04,brass,0,.08,0,h);box(.14,.045,.04,brass,.055,.17,0,h);box(.045,.045,.09,dark,.1,.17,.04,h);return h;}
      function lamp(pos,power){var l=new T.PointLight(0xffd69a,power,4,2);l.position.fromArray(pos);scene.add(l);return l;}
      // A spread of envelopes under the desk lamp is the first thing in view.
      var desk=group([.12,(o.deskTop||.775)+.008,.22]);desk.userData.fixture='envelopes';
      var papers=[];
      for(var i=0;i<4;i++){
        var p=new T.Group();p.position.set((i-1.5)*.16,i*.007,0);p.rotation.y=(i-1.5)*.08;desk.add(p);papers.push(p);
        box(.24,.007,.31,paperMat,0,0,0,p);
        for(var row=0;row<4;row++)box(.13-row*.013,.001,.005,dark,0,.005,-.07+row*.036,p);
      }
      var flap=box(.22,.004,.13,paperMat,-.23,.04,-.1,desk);flap.rotation.x=-.36;
      var memo=box(.18,.005,.12,new T.MeshStandardMaterial({color:0xcfc39d}),.25,.04,.18,desk);
      o.hotspot([.12,(o.deskTop||.775)+.15,.27],[.82,.32,.66],'docs','펼친 봉투');
      var deskLight=lamp([.35,1.22,.28],1.45);
      // The cabinet has a real latch and a drawer, beside the route around the desk.
      var cabinet=group(o.chapter.roomObjects.cabinet);cabinet.userData.fixture='cabinet';
      box(.82,1,.58,metal,0,.5,0,cabinet);
      var drawer=new T.Group();drawer.position.set(0,.67,.32);cabinet.add(drawer);
      box(.72,.26,.055,dark,0,0,0,drawer);box(.12,.035,.065,brass,0,0,.055,drawer);
      for(var w=0;w<4;w++)box(.065,.085,.03,brass,(w-1.5)*.07,.075,.047,drawer);
      var storedCrank=hardware(drawer,-.2,.09,-.11);var storedRule=box(.23,.09,.012,brass,.16,.12,-.11,drawer);
      localHit(cabinet,[0,.69,.32],[.9,.65,.3],'escape:cabinet','규정함 걸쇠');
      o.block(cabinet.position.x,cabinet.position.z,.42);
      // A front-facing machine lets the empty sockets read from the initial approach.
      var machine=group(o.chapter.roomObjects.bench);machine.userData.fixture='bench';
      box(.97,.48,.65,metal,0,.92,0,machine);
      [-.39,.39].forEach(function(x){box(.065,.72,.065,dark,x,.36,0,machine);});
      var socket=box(.055,.13,.015,dark,.27,.99,.334,machine);
      var crank=hardware(machine,.27,.96,.35);crank.visible=false;
      var plateSocket=box(.3,.15,.015,dark,-.21,1.01,.333,machine);
      var rulePlate=box(.27,.13,.013,brass,-.21,1.01,.343,machine);rulePlate.visible=false;
      var plate=box(.16,.1,.014,brass,-.31,.76,.34,machine);plate.rotation.z=-.12;
      var output=box(.45,.005,.18,paperMat,0,.68,.32,machine);output.visible=false;
      var keyDrawer=new T.Group();keyDrawer.position.set(.26,.64,.3);machine.add(keyDrawer);
      box(.3,.11,.05,dark,0,0,0,keyDrawer);
      var key=box(.13,.015,.035,brass,0,.07,-.06,keyDrawer);key.visible=false;
      var indicator=new T.Mesh(new T.SphereGeometry(.045,10,8),new T.MeshBasicMaterial({color:0x57492f}));indicator.position.set(0,1.08,.335);machine.add(indicator);
      var taskLight=lamp([machine.position.x,1.6,machine.position.z+.2],.25), lightTarget=.25;
      localHit(machine,[0,.96,.34],[1.08,.72,.32],'escape:bench','시험대');
      o.block(machine.position.x,machine.position.z,.5);
      done();
      return {
        update:function(dt){
          if(spin>0){crank.rotation.z+=dt*9;spin=Math.max(0,spin-dt);}
          taskLight.intensity+=(lightTarget-taskLight.intensity)*Math.min(1,dt*5);
        },
        sync:function(w,phase){
          deskLight.intensity=w.cards.length ? .85 : 1.45;flap.rotation.x=w.cards.length?-.08:-.36;
          drawer.position.z=w.cabinet ? .57 : .32;storedCrank.visible=w.cabinet&&!w.crank;storedRule.visible=w.cabinet&&!w.rule;
          crank.visible=w.installed;rulePlate.visible=w.installed;socket.visible=!w.installed;plateSocket.visible=!w.installed;
          output.visible=!!w.run&&!w.receipt;plate.rotation.x=w.plate ? .42 : 0;
          keyDrawer.position.z=phase==='approved' ? .53 : .3;key.visible=phase==='approved'&&!w.key;
          indicator.material.color.setHex(phase==='approved'?0x98b879:phase==='revised'?0xd4a256:0x57492f);
          lightTarget=['revised','verified','approved'].includes(phase)?1.3:.25;
          papers.forEach(function(p,i){var id=o.chapter.teams[i].id;p.position.z=w.routes[id]==='archive'?-.13:w.routes[id]==='bench' ? .12 : 0;});
          if(w.run&&w.run!==lastRun){lastRun=w.run;spin=1.3;}
        },
        phase:function(phase){lightTarget=['revised','verified','approved'].includes(phase)?1.3:.25;}
      };
    }
  };
})(window);
