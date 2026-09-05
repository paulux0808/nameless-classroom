import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parseHTML } from 'linkedom';

const require = createRequire(import.meta.url);
const THREE = require('../../assets/vendor/three.min.js');
const source = readFileSync(new URL('../engine.js', import.meta.url), 'utf8');

function setup() {
  const { document } = parseHTML('<html><body><div id="reticle"></div><div id="label"></div></body></html>');
  const context = { THREE, document, N2: {}, navigator: { maxTouchPoints: 0 },
    innerWidth: 800, innerHeight: 600, addEventListener() {} };
  context.window = context;
  vm.createContext(context);
  // Test-only access to private engine state. Production exports stay unchanged.
  const instrumented = source.replace('  global.N2Engine = {', `
  global.targetingFixture = {
    mount: function (objects, actor, hit, view) {
      hotspots = objects; npc = actor; npcHit = hit; camera = view;
      ray = new THREE.Raycaster();
    },
    showNPC: showNPC, hover: hover, invisibleHit: invisibleHit, hot: hot
  };
  global.N2Engine = {`);
  assert.notEqual(instrumented, source);
  vm.runInContext(instrumented, context);
  const fixture = context.targetingFixture;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 800 / 600, 0.05, 80);
  camera.updateMatrixWorld(true);
  const actor = new THREE.Group();
  const npcHit = fixture.hot(fixture.invisibleHit(0.8, 1.78, 0.8, [0, 0, -1]), 'npc', 'RICHARD');
  const door = fixture.hot(fixture.invisibleHit(1.05, 2.12, 0.3, [0, 0, -2]), 'door', '문');
  scene.add(actor, npcHit, door);
  scene.updateMatrixWorld(true);
  fixture.mount([npcHit, door], actor, npcHit, camera);
  return { fixture, engine: context.N2Engine, document, actor, npcHit, door };
}

test('departed Richard cannot intercept the door ray, including transparent interaction meshes', () => {
  const app = setup();
  assert.equal(app.engine._aim().id, 'npc');
  app.fixture.showNPC(false);
  assert.equal(app.actor.visible, false);
  assert.equal(app.npcHit.visible, false);
  assert.equal(app.door.material.opacity, 0);
  assert.equal(app.engine._aim().id, 'door');
  app.fixture.hover(400, 300);
  assert.equal(app.document.querySelector('#label').textContent, '문');
});

test('departure clears stale hover immediately and returning Richard becomes targetable again', () => {
  const app = setup();
  app.fixture.hover(400, 300);
  const label = app.document.querySelector('#label');
  const reticle = app.document.querySelector('#reticle');
  assert.equal(label.textContent, 'RICHARD');
  assert.ok(reticle.classList.contains('hot'));
  app.fixture.showNPC(false);
  assert.equal(label.textContent, '');
  assert.equal(label.classList.contains('show'), false);
  assert.equal(reticle.classList.contains('hot'), false);
  app.fixture.showNPC(true);
  assert.equal(app.engine._aim().id, 'npc');
  app.fixture.hover(400, 300);
  assert.equal(label.textContent, 'RICHARD');
});
