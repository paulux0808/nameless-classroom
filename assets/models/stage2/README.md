# Stage 2 — Chapter 01–06 GLB Library

This directory contains the open-asset library for Stage 2 through Chapter 6.
Every downloaded model is packed as a self-contained GLB so GitHub Pages does
not need separate texture or `.bin` requests.

## Directory map

| Directory | Scope |
| --- | --- |
| `common/` | Reusable office, furniture, documents, storage, lighting, and facility props |
| `ch01/` | Richard — calculation chain |
| `ch02/` | Enrico — conditions and regulation |
| `ch03/` | Luis — calibration and instrumentation |
| `ch04/` | John — multi-channel timing and recording |
| `ch05/` | George — material test area |
| `ch06/` | Emilio — night sample/counting area |

The generated root manifest records every file's chapter usage, source page,
creator, license, selected texture resolution, original dimensions, byte size,
and SHA-256 checksum. Each subdirectory also receives a smaller group manifest.

## Coverage

| Chapter | GLB coverage |
| --- | --- |
| Common | Director/work desks, chairs, lamps, shelves, file drawers, instrument rack, cart, binder, clipboard, paper, stationery, stapler, coffee service, clock, books, radio transceiver, workbench, trash can, stamp reference |
| CH01 | High-detail keyed mechanical-machine reference, printing-calculator silhouette, generic rigged NPC reference |
| CH02 | Large chalkboard and researcher stool; graphs, rules, and chalk writing remain dynamic surfaces |
| CH03 | CRT housing, analog multimeter, dense instrument panel, modular cables, power cabinet, reference clock, instrument bench, wall light |
| CH04 | Filmstrip projector, still camera, recording-camera housing, signal light, secondary monitor/amplifier housing, projection screen |
| CH05 | Drill presses, vice, compressor, generator, welding cart, overhead crane, barrier/fence, ducts, pipes, tool storage, measuring tools, crate, material stock, inspection lights |
| CH06 | Chemistry glassware, microscope, burner, metal containers, enamel/sample-tray references, sample table, portable lights, detector reference |

## Quality levels

- `production-candidate`: High-quality PBR source with a reusable shape and an
  open license. Final scale, pivot, collision, LOD, and historical fit still
  require scene approval.
- `visual-reference`: High-quality PBR asset whose materials or silhouette are
  useful, but visible anachronistic or role-specific details must be changed.
- `reference-only`: A legal placeholder/reference that must not be treated as
  final production art.

The texture policy follows the mobile performance guide: 2K is retained for
close interactable/story props, while repeated furniture and large background
equipment use 1K. Repeated desks, chairs, lights, racks, and machines should be
instanced.

## Elements intentionally kept code-native

The following are stateful interaction surfaces, not missing static art:

- calculation cards and card-tray contents
- regulation sheets, graphs, calibration records, timing sheets, reports
- SAMPLE A/B labels, revisions, dates, sources, redaction bars, and stamps
- CRT traces, counters, gauge needles, indicator lamps, buttons, switches, knobs
- room shells, doors, windows, barriers, collision proxies, and interaction zones
- dust, impact debris, cable splines, and chapter-state lighting

Build these with geometry plus CanvasTexture/HTML or effects so text remains
readable, spoiler-safe, and synchronized with chapter state.

## Important reference-only restrictions

- `common/rubber_stamp_base.glb` is not the final PBR REJECTED/APPROVED pair.
- `ch01/printing_calculator_reference.glb` is not a period-final 1943 machine.
- `ch01/richard_reference_business_man.glb` is a generic rig reference and is
  not a Richard Feynman likeness.
- `ch06/metal_detector.glb` is a modern silhouette reference and must not ship
  as Emilio's counter/detector.

Additional item-specific period warnings are stored in the generated manifest.

## Licensing

- Poly Haven models: CC0 1.0.
- Rubber Stamp by Poly by Google via Poly Pizza: Creative Commons Attribution
  as displayed on the source page.
- Printing Calculator by Bruno Oliveira via Poly Pizza: Creative Commons
  Attribution as displayed on the source page.
- Business Man by manoeldarochadeoliveira via Sketchfab: CC BY 4.0. If retained
  in a distributed build, credit the author and link its source and license.

Do not remove `manifest.generated.json`; it is the authoritative attribution and
source record for the packaged files.

## Rebuild and validation

```bash
node tools/import-stage2-assets.mjs
node tools/validate-stage2-assets.mjs
```

The importer verifies Poly Haven MD5 values before packaging. The validator
checks GLB v2 headers, declared byte lengths, meshes, embedded dependencies, and
manifest SHA-256/byte-count matches for every model.
