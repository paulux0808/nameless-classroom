#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const ASSET_ROOT = path.join(REPO_ROOT, 'assets', 'models', 'stage2');
const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

async function collectGlbs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await collectGlbs(fullPath));
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) results.push(fullPath);
  }
  return results.sort();
}

function parseGlb(data, relativeFile) {
  if (data.length < 20 || data.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${relativeFile}: missing glTF binary header`);
  const version = data.readUInt32LE(4);
  const declaredLength = data.readUInt32LE(8);
  if (version !== 2) throw new Error(`${relativeFile}: unsupported GLB version ${version}`);
  if (declaredLength !== data.length) throw new Error(`${relativeFile}: declared ${declaredLength} bytes, read ${data.length}`);

  let offset = 12;
  let json;
  while (offset < data.length) {
    const chunkLength = data.readUInt32LE(offset);
    const chunkType = data.readUInt32LE(offset + 4);
    const chunkData = data.subarray(offset + 8, offset + 8 + chunkLength);
    if (chunkType === JSON_CHUNK) json = JSON.parse(chunkData.toString('utf8').trim());
    offset += 8 + chunkLength;
  }
  if (!json) throw new Error(`${relativeFile}: JSON chunk not found`);

  const externalUris = [...(json.buffers ?? []), ...(json.images ?? [])]
    .map((entry) => entry.uri)
    .filter((uri) => typeof uri === 'string' && !uri.startsWith('data:'));
  let triangles = 0;
  let vertices = 0;
  let primitives = 0;
  for (const mesh of json.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      primitives += 1;
      const positionAccessor = json.accessors?.[primitive.attributes?.POSITION];
      const indexAccessor = json.accessors?.[primitive.indices];
      const count = indexAccessor?.count ?? positionAccessor?.count ?? 0;
      const mode = primitive.mode ?? 4;
      vertices += positionAccessor?.count ?? 0;
      if (mode === 4) triangles += Math.floor(count / 3);
      if (mode === 5 || mode === 6) triangles += Math.max(0, count - 2);
    }
  }
  return {
    file: relativeFile, validGlb2: true, selfContained: externalUris.length === 0, externalUris,
    bytes: data.length, sha256: sha256(data), scenes: json.scenes?.length ?? 0,
    nodes: json.nodes?.length ?? 0, meshes: json.meshes?.length ?? 0, primitives, vertices, triangles,
    materials: json.materials?.length ?? 0, textures: json.textures?.length ?? 0,
    animations: json.animations?.length ?? 0, skins: json.skins?.length ?? 0,
    extensionsRequired: json.extensionsRequired ?? [],
  };
}

const manifest = JSON.parse(await readFile(path.join(ASSET_ROOT, 'manifest.generated.json'), 'utf8'));
const manifestByFile = new Map(manifest.assets.map((asset) => [asset.file, asset]));
if (manifestByFile.size !== manifest.assets.length) throw new Error('Root manifest contains duplicate file entries');

const files = await collectGlbs(ASSET_ROOT);
if (files.length !== manifestByFile.size) throw new Error(`Manifest lists ${manifestByFile.size} GLBs, directory contains ${files.length}`);
const assets = [];
for (const file of files) {
  const relativeFile = path.relative(REPO_ROOT, file);
  const data = await readFile(file);
  const result = parseGlb(data, relativeFile);
  const manifestEntry = manifestByFile.get(relativeFile);
  if (!manifestEntry) throw new Error(`${relativeFile}: missing from root manifest`);
  if (manifestEntry.bytes !== result.bytes) throw new Error(`${relativeFile}: manifest byte count mismatch`);
  if (manifestEntry.sha256 !== result.sha256) throw new Error(`${relativeFile}: manifest SHA-256 mismatch`);
  if (!result.selfContained) throw new Error(`${relativeFile}: contains external URIs`);
  if (!result.meshes || !result.primitives) throw new Error(`${relativeFile}: contains no mesh primitives`);
  assets.push(result);
}

const byGroup = Object.fromEntries(['common', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06'].map((group) => [
  group,
  assets.filter((asset) => asset.file.includes(`/stage2/${group}/`)).length,
]));
const report = {
  schemaVersion: 2,
  summary: {
    files: assets.length, bytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
    triangles: assets.reduce((sum, asset) => sum + asset.triangles, 0),
    textures: assets.reduce((sum, asset) => sum + asset.textures, 0),
    animationClips: assets.reduce((sum, asset) => sum + asset.animations, 0),
    allValidGlb2: assets.every((asset) => asset.validGlb2),
    allSelfContained: assets.every((asset) => asset.selfContained), manifestMatches: true, byGroup,
  },
  assets,
};
await writeFile(path.join(ASSET_ROOT, 'validation.generated.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
