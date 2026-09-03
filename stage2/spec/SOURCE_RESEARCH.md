# OPEN-SOURCE ADOPTION NOTES

Research date: 2026-09-02.

The runtime favors small, well-maintained, permissively licensed components that can be bundled locally. The goal is not dependency count; it is to replace error-prone generic infrastructure with mature implementations while keeping NAMELESS2-specific story/state rules explicit and auditable.

## Adopted

### three 0.185.0 — MIT
Renderer, scene graph, camera, animation mixer, WebAudio integration, glTF/KTX2 loaders. r185 is pinned so chapter builds do not drift with API changes.

### three-mesh-bvh 0.9.12 — MIT
Accelerates interaction raycasts/spatial queries. Used on registered interaction proxies instead of raycasting the entire scene. The library supports three >=0.159, so it is compatible with r185.

### @tweenjs/tween.js 25.0.0 — MIT
Deterministic interpolation. It is driven by the master runtime's safe/clamped animation clock instead of creating independent RAF loops.

### fflate 0.8.3 — MIT
Small compression/decompression utility for local/inline asset packs.

### idb-keyval 6.3.0 — Apache-2.0
Small IndexedDB adapter for story saves/settings. SaveManager adds semantic validation, backup/temp keys, checksum, debounce, and an in-memory fallback when persistent storage is unavailable.

### @noble/hashes 2.2.0 — MIT
Pure-JS SHA-256 for save-record checksums, avoiding a hard dependency on WebCrypto/secure-context availability. Semantic validation remains more important than cryptographic strength, matching the project specification.

### meshoptimizer 1.1.1 — MIT
Meshopt decoder for compressed glTF/GLB. Asset preparation can use upstream meshoptimizer/gltfpack outside the runtime.

### esbuild-wasm 0.28.1 — MIT
Development-time bundler. WASM avoids platform-specific native binary packages. The build outputs one IIFE directly inside a single chapter HTML, and configured asset imports can be embedded as data URLs.

## Optional

### Basis Universal / KTX2 — Apache-2.0
Three.js KTX2Loader is wired but disabled until a local Basis transcoder path is supplied. No CDN path is permitted. For truly self-contained single-HTML chapters, ordinary inline textures or a separately engineered embedded transcoder are preferable until KTX2 asset volume justifies the extra worker/WASM packaging.

## Deliberately not adopted as a core runtime dependency

### General rigid-body physics engine
The uploaded specification repeatedly prefers authored/canonical object motion, semantic checkpoints, simple colliders, and clearance/sweep checks. A general rigid-body simulation would create additional nondeterminism and save/reconstruction complexity for doors, documents, stamps, handsets, parcels, and cinematic objects. The master therefore uses Three.js math, authored box colliders, reservations, ownership, and animation sweeps. A physics engine can still be introduced for a narrowly justified subsystem later without changing story truth.

## Integration rules

- No dependency may create its own permanent animation loop.
- No remote CDN import is permitted in a built chapter.
- Dependency versions are exact-pinned.
- Chapter code may not bypass `SpoilerGuard` for user-facing story strings.
- External libraries never own story state, checkpoint state, stamp commit state, or reveal level.
- Upgrade a dependency only in master source, run master tests/audits, then rebuild affected chapter HTML files.
