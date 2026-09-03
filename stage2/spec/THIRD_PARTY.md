# THIRD-PARTY COMPONENTS

All runtime libraries are intended to be installed/vendor-cached during development and bundled into each chapter HTML. The finished chapter must not require a CDN or network connection.

| Component | Pinned version | License | Use |
|---|---:|---|---|
| three | 0.185.0 | MIT | WebGL renderer, scene graph, cameras, loaders, WebAudio integration |
| three-mesh-bvh | 0.9.12 | MIT | accelerated raycasting/spatial queries for interaction meshes |
| @tweenjs/tween.js | 25.0.0 | MIT | deterministic wall-clock transform interpolation |
| fflate | 0.8.3 | MIT | optional compressed inline/local asset packs |
| idb-keyval | 6.3.0 | Apache-2.0 | small IndexedDB persistence adapter |
| @noble/hashes | 2.2.0 | MIT | pure-JS SHA-256 checksum without secure-context/WebCrypto dependency |
| meshoptimizer | 1.1.1 | MIT | GLTF Meshopt decoding / optimized geometry pipeline |
| esbuild-wasm | 0.28.1 | MIT | cross-platform development-time bundling into one standalone chapter HTML without platform-specific native binary download |

Optional asset pipeline support:

- KTX2Loader is provided by three.js. The Basis Universal transcoder is Apache-2.0 and should be vendored locally only when KTX2 assets are introduced.
- No general-purpose rigid-body physics engine is selected. The project specification favors authored/canonical object motion and simple collision/clearance volumes over uncontrolled simulation.

Upstream projects:

- https://github.com/mrdoob/three.js
- https://github.com/gkjohnson/three-mesh-bvh
- https://github.com/tweenjs/tween.js
- https://github.com/101arrowz/fflate
- https://github.com/jakearchibald/idb-keyval
- https://github.com/paulmillr/noble-hashes
- https://github.com/zeux/meshoptimizer
- https://github.com/evanw/esbuild
- https://github.com/BinomialLLC/basis_universal

When producing a release, retain the corresponding upstream license and attribution notices in the project credits/distribution package. esbuild is a build-time dependency, but its license should remain documented in the source distribution.
