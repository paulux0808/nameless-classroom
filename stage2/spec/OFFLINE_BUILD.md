# OFFLINE / SINGLE-HTML POLICY

## Runtime

Built chapter HTML must not require a CDN or remote API. JavaScript dependencies are bundled into the HTML. Chapter assets can either be imported into the bundle as data URLs or kept as local files. Imported assets use esbuild data-url loaders in the master build script.

## Development dependency acquisition

`package.json` pins exact package versions. Acquire them once and retain the package manager cache or project `node_modules` in the production workspace. A built chapter itself does not perform package installation and does not need internet access.

## Asset policy

- Prefer Meshopt-compressed glTF/GLB when practical.
- KTX2/Basis is supported as an optional local transcoder path; it must never point to a CDN.
- Story-critical documents, board text, phone/photo/medal/postcard assets remain readable across quality profiles.
- Do not preload later-chapter assets into earlier chapter HTML unless they are genuinely shared.

## Verification

Run:

```sh
npm run check
npm test
node tools/verify-offline.mjs dist/chapter01.html
```

The offline verifier rejects remote script/style/media/resource URLs and obvious runtime networking calls to HTTP(S) endpoints.
