#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const USER_AGENT = 'NamelessAssetPipeline/2.0 (+https://github.com/paulux0808/nameless-classroom)';
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT_ROOT = path.join(REPO_ROOT, 'assets', 'models', 'stage2');

const P = (id, group, resolution, role, chapters, status = 'production-candidate', notes = null) => ({
  id, group, resolution, role, chapters, status, notes,
});

const POLY_HAVEN_MODELS = [
  // Shared 1940s office/facility kit.
  P('metal_office_desk', 'common', '1k', 'Director desk and repeated work desks', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('SchoolDesk_01', 'common', '1k', 'Compact background work-desk variant', ['ch01', 'ch02'], 'visual-reference', 'Retain only if its school-furniture silhouette fits the final 1943 art direction.'),
  P('WoodenChair_01', 'common', '1k', 'Director office visitor chair', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('SchoolChair_01', 'common', '1k', 'Repeated background seating', ['ch01', 'ch02'], 'visual-reference', 'Material treatment may need replacement for period accuracy.'),
  P('desk_lamp_arm_01', 'common', '1k', 'Director and work-desk task light', ['ch01', 'ch03', 'ch04', 'ch06']),
  P('wooden_bookshelf_worn', 'common', '1k', 'File and book storage', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('vintage_radio_transceiver', 'common', '2k', 'WWII-era communications and generic equipment housing', ['ch01', 'ch03', 'ch04']),
  P('vintage_wooden_drawer_01', 'common', '1k', 'Archive and filing drawers', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('drawer_cabinet', 'common', '1k', 'Document and equipment cabinet variant', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06'], 'visual-reference', 'Modern frame details require art-direction review.'),
  P('worn_metal_rack', 'common', '1k', 'Cards, paper, and instrument storage rack', ['ch01', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('industrial_storage_cart', 'common', '1k', 'Equipment and document transport cart', ['ch01', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('binder_notebook', 'common', '2k', 'Submission and revision binder', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('office_notepads', 'common', '2k', 'Reports, timing sheets, and paper stacks', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('clipboard', 'common', '2k', 'NPC report and calibration-record presentation surface', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('stationery_supplies', 'common', '2k', 'Pencils, pens, eraser, and desk cup', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('vintage_stapler', 'common', '2k', 'Period office desk tool', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('tea_set_01', 'common', '1k', 'Director desk coffee service', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('wall_clock', 'common', '1k', 'Facility wall clock', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06'], 'visual-reference', 'Use as a housing reference if the final period clock differs.'),
  P('book_encyclopedia_set_01', 'common', '1k', 'Reference books and shelf dressing', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('industrial_pipe_lamp', 'common', '1k', 'Bench task-light variant', ['ch01', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('mounted_fluorescent_lights', 'common', '1k', 'Bright calculation and laboratory work lights', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05']),
  P('caged_hanging_light', 'common', '1k', 'Period corridor and industrial ceiling light', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('WoodenTable_01', 'common', '1k', 'Calculation and evidence workbench variant', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),
  P('metal_trash_can', 'common', '1k', 'Office and laboratory utility prop', ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']),

  // CH01 — Richard / Calculation Chain.
  P('CashRegister_01', 'ch01', '2k', 'High-detail keyed mechanical-machine material reference', ['ch01'], 'visual-reference', 'Not the final 1943 calculation machine; adapt the housing and remove retail-specific features.'),

  // CH02 — Enrico / Conditions & Regulation.
  P('standing_chalkboard_01', 'ch02', '2k', 'Chalkboard discussion and conditions-review surface', ['ch02']),
  P('painted_wooden_stool', 'ch02', '1k', 'Chalkboard-side researcher stool', ['ch02']),

  // CH03 — Luis / Calibration.
  P('television_02', 'ch03', '2k', 'CRT housing and emissive-screen base', ['ch03', 'ch04'], 'visual-reference', 'Replace anachronistic controls and screen graphics in-scene.'),
  P('retro_multimeter', 'ch03', '2k', 'Analog calibration instrument and gauge reference', ['ch03', 'ch04', 'ch05', 'ch06']),
  P('vintage_spacecraft_instrument', 'ch03', '2k', 'Dense analog instrument panel reference', ['ch03', 'ch04', 'ch06'], 'visual-reference', 'Remove spacecraft/Cyrillic markings; use the gauge and control language only.'),
  P('modular_electric_cables', 'ch03', '1k', 'Modular instrument cable routing', ['ch03', 'ch04', 'ch05', 'ch06']),
  P('power_box_01', 'ch03', '1k', 'Calibration power and control cabinet', ['ch03', 'ch04'], 'visual-reference', 'Modern breaker details require period dressing.'),
  P('mantel_clock_01', 'ch03', '2k', 'Independent reference-clock variant', ['ch03']),
  P('WoodenTable_03', 'ch03', '1k', 'Instrumentation bench', ['ch03', 'ch04', 'ch06']),
  P('industrial_caged_sconce', 'ch03', '1k', 'Instrumentation-area wall light', ['ch03', 'ch04', 'ch05', 'ch06']),

  // CH04 — John / Multi-channel Timing.
  P('filmstrip_projector_8mm', 'ch04', '2k', 'Timing-record projection and film equipment reference', ['ch04'], 'visual-reference', 'Confirm the exact model year before final historical lock.'),
  P('Camera_01', 'ch04', '2k', 'Still-frame timing record camera', ['ch04']),
  P('vintage_video_camera', 'ch04', '2k', 'Large period recording-camera housing', ['ch04'], 'visual-reference', 'Use only after confirming the selected camera design fits the 1943 facility.'),
  P('signal_flashlight', 'ch04', '2k', 'Portable timing/signal light', ['ch04']),
  P('Television_01', 'ch04', '1k', 'Secondary monitor and amplifier housing', ['ch04'], 'visual-reference', 'Use the housing only; replace consumer-TV styling and screen content.'),
  P('projector_screen', 'ch04', '1k', 'Large timing-record review surface', ['ch04']),

  // CH05 — George / Material Test.
  P('old_drill_press', 'ch05', '2k', 'Period material-test machine', ['ch05']),
  P('drill_press_01', 'ch05', '1k', 'Background test-equipment variant', ['ch05'], 'visual-reference', 'Use as background machinery after period-detail review.'),
  P('bench_vice_01', 'ch05', '2k', 'Specimen preparation bench vice', ['ch05']),
  P('old_military_compressor', 'ch05', '1k', 'Large period industrial test-equipment proxy', ['ch05']),
  P('portable_generator', 'ch05', '1k', 'Test-area power equipment proxy', ['ch05'], 'visual-reference', 'Replace modern fittings or keep outside close inspection.'),
  P('portable_welding_cart', 'ch05', '1k', 'Industrial cylinder and service cart', ['ch05'], 'visual-reference', 'Validate cylinder and regulator period details before final use.'),
  P('overhead_crane', 'ch05', '1k', 'Material-test hall overhead machinery', ['ch05']),
  P('modular_chainlink_fence', 'ch05', '1k', 'Observation/test-zone safety separation', ['ch05']),
  P('concrete_road_barrier', 'ch05', '1k', 'Heavy test-zone separation proxy', ['ch05'], 'visual-reference', 'Use only where an indoor period barrier treatment is plausible.'),
  P('modular_airduct_rectangular_01', 'ch05', '1k', 'Industrial ventilation modules', ['ch05']),
  P('modular_industrial_pipes_01', 'ch05', '1k', 'Industrial test-area pipe modules', ['ch05']),
  P('metal_tool_chest', 'ch05', '1k', 'Test-area tool storage', ['ch05']),
  P('metal_toolbox', 'ch05', '2k', 'Close-view period toolbox', ['ch05']),
  P('measuring_tape_01', 'ch05', '2k', 'Specimen measurement prop', ['ch05'], 'visual-reference', 'Replace modern casing if shown in close-up.'),
  P('adjustable_wrench', 'ch05', '2k', 'Period workshop hand tool', ['ch05']),
  P('wooden_crate_01', 'ch05', '1k', 'Generic specimen and equipment crate', ['ch05', 'ch06']),
  P('cement_bag', 'ch05', '1k', 'Material stock and test-area dressing', ['ch05']),
  P('security_light', 'ch05', '1k', 'Observation-side utility light', ['ch05'], 'visual-reference', 'Keep out of close view if its fixture reads as modern.'),
  P('industrial_wall_lamp', 'ch05', '1k', 'Material-test hall wall light', ['ch05']),
  P('portable_searchlight', 'ch05', '1k', 'Test-zone inspection light', ['ch05'], 'visual-reference', 'Use as a lighting proxy after period review.'),

  // CH06 — Emilio / Sample Anomaly.
  P('chemistry_set', 'ch06', '2k', 'Sample glassware and laboratory stand set', ['ch06']),
  P('industrial_microscope', 'ch06', '2k', 'Close-view sample inspection instrument', ['ch06'], 'visual-reference', 'Confirm the final optics and stand against the 1943 reference set.'),
  P('bunsen_burner', 'ch06', '2k', 'Laboratory burner and bench detail', ['ch06']),
  P('medical_box', 'ch06', '2k', 'Metal sample/accessory container', ['ch06'], 'visual-reference', 'Remove medical markings when used as a sample container.'),
  P('pot_enamel_01', 'ch06', '2k', 'Enamel sample tray reference', ['ch06'], 'visual-reference', 'Use as a material reference for a purpose-built shallow sample tray.'),
  P('oil_tin', 'ch06', '2k', 'Small metal sample-canister reference', ['ch06'], 'visual-reference', 'Replace product markings with SAMPLE A/B labels.'),
  P('small_wooden_table_01', 'ch06', '1k', 'Compact night counting-room sample table', ['ch06']),
  P('vintage_flashlight', 'ch06', '2k', 'Night-lab portable task light', ['ch06']),
  P('metal_detector', 'ch06', '1k', 'Detector silhouette reference', ['ch06'], 'reference-only', 'Modern field detector; do not ship as the CH06 counter/detector.'),
  P('brass_pan_01', 'ch06', '2k', 'Small metal tray material reference', ['ch06'], 'visual-reference', 'Purpose-build the final A/B sample tray to the documented dimensions.'),
  P('vintage_oil_lamp', 'ch06', '1k', 'Night-lab ambient period light', ['ch06']),
  P('industrial_pastic_container', 'ch06', '1k', 'Background sample storage container', ['ch06'], 'visual-reference', 'Validate material and period fit before close-view use.'),
];

const DIRECT_GLB_MODELS = [
  {
    id: 'rubber_stamp_base', group: 'common', output: 'rubber_stamp_base.glb',
    url: 'https://static.poly.pizza/540b2e67-e781-4021-aa6a-7486c0e9103f.glb',
    source: 'https://poly.pizza/m/3RdawRyAWKx', author: 'Poly by Google',
    license: 'Creative Commons Attribution (version unspecified on source page)',
    role: 'Shared base mesh for REJECTED and APPROVED stamps', chapters: ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06'],
    status: 'reference-only', notes: 'Replace with bespoke PBR stamp models before final art lock.',
  },
  {
    id: 'printing_calculator_reference', group: 'ch01', output: 'printing_calculator_reference.glb',
    url: 'https://static.poly.pizza/7a4d4936-c920-48da-a3e8-5269b14223a9.glb',
    source: 'https://poly.pizza/m/e9TwpsTfktd', author: 'Bruno Oliveira',
    license: 'Creative Commons Attribution (version unspecified on source page)',
    role: 'Printing-calculator silhouette and layout reference', chapters: ['ch01'],
    status: 'reference-only', notes: 'Replace with a period-accurate 1943 calculation machine before final art lock.',
  },
];

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function fetchJson(url) {
  return JSON.parse((await fetchBuffer(url)).toString('utf8'));
}

function digest(algorithm, data) {
  return createHash(algorithm).update(data).digest('hex');
}

async function downloadVerified(file, destination) {
  const data = await fetchBuffer(file.url);
  if (file.md5 && digest('md5', data) !== file.md5) throw new Error(`MD5 mismatch: ${file.url}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, data);
}

async function importPolyHavenModel(model, scratchRoot) {
  const [files, info] = await Promise.all([
    fetchJson(`https://api.polyhaven.com/files/${model.id}`),
    fetchJson(`https://api.polyhaven.com/info/${model.id}`),
  ]);
  const gltfFile = files.gltf?.[model.resolution]?.gltf;
  if (!gltfFile) throw new Error(`No ${model.resolution} glTF package for ${model.id}`);

  const sourceDir = path.join(scratchRoot, model.id);
  const sourcePath = path.join(sourceDir, `${model.id}.gltf`);
  await downloadVerified(gltfFile, sourcePath);
  await Promise.all(Object.entries(gltfFile.include ?? {}).map(([relativePath, includedFile]) =>
    downloadVerified(includedFile, path.join(sourceDir, relativePath))));

  const outputPath = path.join(OUTPUT_ROOT, model.group, `${model.id}.glb`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await execFileAsync('npx', ['--yes', '@gltf-transform/cli@4.2.1', 'copy', sourcePath, outputPath], {
    cwd: REPO_ROOT,
    maxBuffer: 16 * 1024 * 1024,
  });

  const output = await readFile(outputPath);
  if (output.subarray(0, 4).toString('ascii') !== 'glTF') throw new Error(`Invalid GLB header: ${outputPath}`);
  return {
    id: model.id,
    group: model.group,
    chapters: model.chapters,
    name: info.name,
    file: path.relative(REPO_ROOT, outputPath),
    source: `https://polyhaven.com/a/${model.id}`,
    downloadApi: `https://api.polyhaven.com/files/${model.id}`,
    author: Object.keys(info.authors ?? {}).join(', ') || 'See Poly Haven source page',
    license: 'CC0 1.0',
    resolution: model.resolution,
    role: model.role,
    status: model.status,
    notes: model.notes,
    polycount: info.polycount ?? null,
    dimensionsMillimeters: info.dimensions ?? null,
    bytes: output.length,
    sha256: digest('sha256', output),
  };
}

async function importDirectGlb(model) {
  const data = await fetchBuffer(model.url);
  if (data.subarray(0, 4).toString('ascii') !== 'glTF') throw new Error(`Invalid GLB header: ${model.url}`);
  const outputPath = path.join(OUTPUT_ROOT, model.group, model.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, data);
  return {
    id: model.id, group: model.group, chapters: model.chapters,
    file: path.relative(REPO_ROOT, outputPath), source: model.source, downloadUrl: model.url,
    author: model.author, license: model.license, resolution: 'source GLB', role: model.role,
    status: model.status, notes: model.notes, bytes: data.length, sha256: digest('sha256', data),
  };
}

async function importRichardReference() {
  const sourcePath = path.join(REPO_ROOT, 'assets', 'models', 'teacher', 'teacher.glb');
  const outputPath = path.join(OUTPUT_ROOT, 'ch01', 'richard_reference_business_man.glb');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await copyFile(sourcePath, outputPath);
  const output = await readFile(outputPath);
  return {
    id: 'richard_reference_business_man', group: 'ch01', chapters: ['ch01'],
    file: path.relative(REPO_ROOT, outputPath),
    source: 'https://sketchfab.com/3d-models/business-man-low-polygon-game-character-b6f6740f883b4749abac47af0045a9dd',
    author: 'manoeldarochadeoliveira', license: 'CC BY 4.0',
    resolution: '1024px PBR; rigged; 25 animation clips',
    role: 'Generic mobile NPC rig reference', status: 'reference-only',
    notes: 'Not a Richard Feynman likeness. Do not ship it as Richard Feynman.',
    bytes: output.length, sha256: digest('sha256', output),
  };
}

async function mapWithConcurrency(items, limit, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await callback(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function writeManifests(records) {
  const policy = {
    coordinateConvention: '+Y up; normalize scale and pivot at placement time',
    packaging: 'Self-contained GLB; no external texture or BIN dependencies',
    texturePolicy: '2K for close interactable/story props; 1K for repeated furniture and background architecture',
    loadingPolicy: 'Load common plus the active chapter only; instance repeated meshes',
  };
  const rootManifest = { schemaVersion: 2, scope: 'stage2-ch01-through-ch06', policy, assets: records };
  await writeFile(path.join(OUTPUT_ROOT, 'manifest.generated.json'), `${JSON.stringify(rootManifest, null, 2)}\n`);

  for (const group of ['common', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']) {
    const assets = records.filter((record) => record.group === group);
    await writeFile(
      path.join(OUTPUT_ROOT, group, 'manifest.generated.json'),
      `${JSON.stringify({ schemaVersion: 2, group, policy, assets }, null, 2)}\n`,
    );
  }
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  for (const group of ['common', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06']) {
    await rm(path.join(OUTPUT_ROOT, group), { recursive: true, force: true });
    await mkdir(path.join(OUTPUT_ROOT, group), { recursive: true });
  }

  const scratchRoot = await mkdtemp(path.join(tmpdir(), 'nameless-stage2-assets-'));
  const records = [];
  try {
    records.push(...await mapWithConcurrency(POLY_HAVEN_MODELS, 4, async (model) => {
      console.log(`Importing ${model.group}/${model.id} (${model.resolution})...`);
      const record = await importPolyHavenModel(model, scratchRoot);
      console.log(`Imported ${model.group}/${model.id}.`);
      return record;
    }));
    records.push(...await Promise.all(DIRECT_GLB_MODELS.map(importDirectGlb)));
    records.push(await importRichardReference());
    await writeManifests(records);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }

  const totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
  console.log(`Imported ${records.length} GLBs (${(totalBytes / 1048576).toFixed(2)} MiB).`);
}

await main();
