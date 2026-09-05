/* Scene dressing and ensemble for the shared review room. */
(function (global) {
  'use strict';
  global.N2ConditionRoom = {
    create: function (o, done) {
      var T = global.THREE, actors = [], mixers = [], lamps = [], labels = [];
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
      sign('규정함 / S-12', 2.6, 2.1, -3.1, 1.25);
      sign('시험 조건 배정표', -2.6, 2.1, -3, 1.4);
      o.hotspot([2.6, 1.25, -3], [1.2, 1.7, .6], 'references', '규정함 · 장비 대장');
      o.hotspot([-2.6, 1.1, -2.9], [1.2, 1.7, .6], 'docs', '시험 조건 배정표');
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
