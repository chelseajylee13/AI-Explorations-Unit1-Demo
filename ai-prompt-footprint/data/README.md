# Frozen Feature 1 source inputs

This directory separates pinned source data from calculation and interface code.

## EcoLogits video data

`upstream/ecologits-0.11.1/` contains byte-identical copies of the two upstream files needed by the approved video method. They come from EcoLogits tag `0.11.1`, commit `886d1ebfadb51a2d6407fcea6d9778c997c85c35`, released July 7, 2026. `source-manifest.json` records their hashes, boundaries, roles, and limitations.

The import is reproducible:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\import-ecologits-video-data.ps1 -EcoLogitsSource <path-to-ecologits-0.11.1>
```

The script refuses to import either file unless its SHA-256 hash matches the reviewed release. Runtime code must use these local files, not a live API or mutable web page.

Provider defaults are intentional. In EcoLogits `0.11.1`, video calls without an explicit data-center location use each provider record's location, PUE, and WUE. The calculator will preserve that behavior and retain source warnings. Video usage carbon uses the matching electricity-mix record; video water includes direct data-center and electricity-generation consumption but not embodied water.

## Image-data hold

The Bertazzini et al. arXiv source package was inspected for the approved 17-model by 3-resolution table. It contains plotted results and summary text, but no machine-readable observations or numeric per-model/per-resolution lower, median, and upper table. Digitizing chart pixels would create inferred coefficients, contrary to the approved specification.

The pending record in `source-manifest.json` documents this gap. Image calculation work remains blocked—not substituted with a universal resolution multiplier or proprietary-service mapping—until the authors' companion data can be obtained and checked. `docs/image-energy-data-request.md` is a ready-to-send request for those data.

Verify the frozen files and their structural invariants with:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\verify-frozen-source-data.ps1
```
