/* Scene dressing and ensemble for the shared review room. */
(function (global) {
  'use strict';
  global.N2ConditionRoom = {
    create: function (o, done) {
      var T = global.THREE, actors = [], mixers = [], lamps = [], labels = [], lastPrint = null, spin = 0;
      function sign(text, x, y, z, width) {
        var canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#243933'; ctx.fillRect(0, 0, 768, 192);
        ctx.strokeStyle = '#b0a57b'; ctx.lineWidth = 5; ctx.strokeRect(12, 12, 744, 168);
        ctx.fillStyle = '#eee5c9'; ctx.textAlign = 'center'; ctx.font = '500 52px sans-serif'; ctx.fillText(text, 384, 115);
        var mesh = new T.Mesh(new T.PlaneGeometry(width, width / 4), new T.MeshBasicMaterial({ map: new T.CanvasTexture(canvas), side: T.DoubleSide }));
        mesh.position.set(x, y, z); o.scene.add(mesh); return mesh;
      }
      sign('COMMON REVIEW / 02', 0, 2.65, -3.94, 2.6);
      sign('원기록 보관', 2.6, 2.1, -3.1, 1.25);
      sign('새 장비 / 새 조건', -2.6, 2.1, -3, 1.4);
      var cabinetSign=sign('규정함', -2.55, 1.25, 2.3, .8); cabinetSign.rotation.y=Math.PI/2;
      o.hotspot([-2.6,.75,2.3],[.55,1.2,1.1],'escape:cabinet','규정함 · 숫자 걸쇠');
      var metal=new T.MeshStandardMaterial({color:0x384c46,roughness:.72});
      var brass=new T.MeshStandardMaterial({color:0xb19960,metalness:.55,roughness:.4});
      function box(w,h,d,mat,x,y,z,parent){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;(parent||o.scene).add(m);return m;}
      var machine=new T.Group();machine.position.set(2.75,0,1.55);machine.rotation.y=-Math.PI/2;o.scene.add(machine);
      box(1.1,.45,.65,metal,0,.9,0,machine);
      [-.45,.45].forEach(function(x){box(.075,.7,.075,metal,x,.35,0,machine);});
      var crank=new T.Group();crank.position.set(.3,.94,.36);machine.add(crank);
      box(.06,.26,.04,brass,0,.1,0,crank);box(.16,.055,.05,brass,.06,.23,0,crank);
      var grip=new T.Mesh(new T.CylinderGeometry(.04,.04,.12,12),metal);grip.rotation.x=Math.PI/2;grip.position.set(.13,.23,.04);crank.add(grip);crank.visible=false;
      var rulePlate=box(.33,.22,.012,brass,-.3,.99,.335,machine);rulePlate.visible=false;
      var paper=box(.43,.007,.21,new T.MeshStandardMaterial({color:0xece3c8}),0,.68,.3,machine);paper.visible=false;
      var key=box(.12,.018,.035,brass,.32,.68,.3,machine);key.visible=false;
      var plate=box(.2,.12,.015,brass,0,1.14,0,machine);
      var lockCover=box(.055,.25,.5,metal,-2.49,.6,2.3);
      var statusBulb=new T.Mesh(new T.SphereGeometry(.045,10,8),new T.MeshBasicMaterial({color:0x8d593e}));statusBulb.position.set(0,1.03,.35);machine.add(statusBulb);
      var machineSign=sign('K–2 / 시험대',2.58,1.48,1.55,1);machineSign.rotation.y=-Math.PI/2;
      o.hotspot([2.5,.86,1.55],[.5,.72,1.15],'escape:bench','시험대 · 손잡이 축');
      o.hotspot([2.7,1.23,1.55],[.42,.18,.45],'escape:plate','시험대의 금속 명판');
      o.block(2.75,1.55,.5);
      [-2.8, 2.8].forEach(function (x) {
        var light = new T.PointLight(0xffe7b6, .12, 6, 2); light.position.set(x, 2.7, -.3); o.scene.add(light); lamps.push(light);
        var bulb = new T.Mesh(new T.SphereGeometry(.09, 10, 8), new T.MeshBasicMaterial({ color: 0xffe5b1 })); bulb.position.copy(light.position); o.scene.add(bulb);
      });
      var remaining = o.chapter.teams.length;
      function finish() { if (--remaining === 0) done(); }
      o.chapter.teams.forEach(function (team, index) {
        var label = sign(team.name + ' / ' + team.role, team.pos[0], 1.98, team.pos[2], .95); labels.push(label);
        var hit = o.hotspot([team.pos[0], .9, team.pos[2]], [.7, 1.8, .7], 'team:' + team.id, team.name + ' · ' + team.role);
        o.block(team.pos[0], team.pos[2], .38);
        function install(obj, gltf) {
          obj.position.set(team.pos[0], 0, team.pos[2]); obj.rotation.y = team.pos[0] < 0 ? Math.PI / 2 : -Math.PI / 2;
          o.scene.add(obj); actors.push({ obj: obj, hit: hit, label: label, team: team });
          if (gltf && gltf.animations.length) {
            var mixer = new T.AnimationMixer(obj), clip = T.AnimationClip.findByName(gltf.animations, 'Rig|idle');
            if (clip) { mixer.clipAction(clip).play(); mixer.update(index * .7); mixers.push(mixer); }
          }
          finish();
        }
        function fallback() {
          var figure = new T.Group(), coat = new T.MeshStandardMaterial({ color: team.color });
          var torso = new T.Mesh(new T.CylinderGeometry(.2, .26, .7, 8), coat); torso.position.y = 1.1; figure.add(torso);
          var head = new T.Mesh(new T.SphereGeometry(.16, 12, 10), new T.MeshStandardMaterial({ color: 0xbfa68b })); head.position.y = 1.65; figure.add(head);
          [-.12, .12].forEach(function (x) { var leg = new T.Mesh(new T.CylinderGeometry(.075, .075, .75, 8), coat); leg.position.set(x, .38, 0); figure.add(leg); });
          install(figure);
        }
        if (!T.GLTFLoader) { fallback(); return; }
        new T.GLTFLoader().load('../assets/models/' + o.chapter.npcModel.path, function (gltf) {
          var obj = gltf.scene; obj.scale.setScalar(.94 + index * .025);
          obj.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
          install(obj, gltf);
        }, undefined, fallback);
      });
      return {
        update: function (dt, camera) {
          mixers.forEach(function (m) { m.update(dt); });
          labels.forEach(function (label) { label.quaternion.copy(camera.quaternion); });
          if(spin>0){crank.rotation.z+=dt*9;spin=Math.max(0,spin-dt);}
        },
        sync: function(w,phase){
          crank.visible=w.installed;rulePlate.visible=w.installed;paper.visible=!!w.run&&!w.receipt;
          key.visible=phase==='approved'&&!w.key;lockCover.position.x=w.cabinet?-2.25:-2.49;
          plate.rotation.x=w.plate ? 0.6 : 0;statusBulb.material.color.setHex(phase==='approved'?0x8eb76e:0x8d593e);
          if(w.run&&w.run!==lastPrint){lastPrint=w.run;spin=1.4;}
        },
        phase: function (phase) {
          lamps.forEach(function (light) { light.intensity = phase === 'approved' ? 1.5 : .12; });
          actors.forEach(function (a) {
            // Representatives stay beside their records; the central exit remains clear.
            a.obj.rotation.y = phase === 'approved' ? 0 : (a.team.pos[0] < 0 ? Math.PI / 2 : -Math.PI / 2);
          });
        }
      };
    }
  };
})(window);
