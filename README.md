# Artboard PDF Exporter

A Photoshop panel that turns selected artboards into an ordered multipage PDF or separate PDFs. Runs locally, with no accounts, API keys, subscriptions, or network requests from the plugin.

**Select artboards in Photoshop → arrange pages → choose compression → export.**

Only Photoshop-selected artboards appear in the panel. Selecting layers inside an artboard brings in their parent artboard. Nothing selected means an empty panel.

## Install

Requires **Photoshop 25.0+** and **Adobe UXP Developer Tool** on macOS or Windows. Limited real-host validation has been completed on Photoshop **27.11.0 / macOS**. Windows and the full integration matrix remain pending.

1. Download this repository with **Code → Download ZIP**, then extract it. Keep the entire extracted folder.
2. Install [Adobe UXP Developer Tools](https://creativecloud.adobe.com/apps/download/uxp-developer-tools). Accept its Developer Mode prompt.
3. In Photoshop, enable **Preferences → Plugins → Enable Developer Mode**. On Windows, preferences are under **Edit**. Save your work, quit Photoshop completely, then reopen it.
4. Open UXP Developer Tool and choose **Add Plugin**.
5. Select **`dist/manifest.json`**, then click **Load**.
6. Open **Plugins → Artboard PDF Exporter** if the panel does not appear.

The bundled `dist/` folder is ready to load. Node.js is only needed to change or rebuild the source. **Do not select the root `manifest.json`**, which is the build input.

See the [installation guide](docs/INSTALLATION.md) for first-use steps, updates, `.ccx` packaging, and troubleshooting.

## Use

1. Open an artboard PSD and select the artboards you want in Photoshop's Layers panel. The panel follows selection changes automatically.
2. Check the thumbnails. Use **Update selection** after editing the artwork or when you want to re-import the selection.
3. Drag rows into page order, or click a row and use **Move up / Move down**. Uncheck a row to exclude it from export.
4. Choose **Compression** and **Resolution**. Open **Options** for JPEG quality, transparency, background, filename, and separate-file output.
5. Click **Export**. The plugin renders first, then asks where to save. Wait for the saved-file confirmation before opening the PDF.

The Photoshop layer stack and artboard positions are not rearranged. Retained artboards keep their relative PDF order when the selection updates.

## Features

- Selection-only thumbnails, stable artboard IDs, duplicate names, and Unicode names.
- Arbitrary PDF page order with keyboard-accessible ordering buttons.
- Single multipage PDF or one PDF per artboard.
- Mixed page sizes and orientations, with source aspect ratios preserved.
- JPEG quality 1–100, resolution presets, or lossless RGB transparency.
- Configurable background for JPEG pages.
- Local progress, cancellation before saving, and document-change checks.
- Byte-for-byte saved-file verification before success is reported.

| Compression preset | JPEG quality | Resolution |
| --- | ---: | --- |
| Maximum Quality | 100 | Original |
| Print Quality | 95 | 300 DPI |
| Balanced | 80 | 150 DPI |
| Small File | 55 | 72 DPI |
| Custom | User setting | Original, 300, 150, 96, or 72 DPI |

Resolution downsamples pixels without changing the physical page size. It never enlarges the source. Lossless transparency ignores JPEG quality. These controls compress page imagery; they do not perform whole-PDF optimization or guarantee a file size.

## Source protection

Rendering happens inside `executeAsModal`. The plugin duplicates the source document once, isolates each artboard in that private duplicate, reads composite pixels, then closes the duplicate without saving. It also registers the duplicate for host cleanup.

The original PSD is not edited, flattened, cropped, saved, closed, or reordered. Source IDs are mapped to layer index paths in the duplicate because copied layer IDs can differ.

PDF generation finishes before the save picker opens. Single-file replacement uses the native picker's confirmation. Separate export rejects existing filenames and uses page numbers plus artboard IDs to distinguish duplicate names. Writes are read back and checked before success is shown.

## Build and verify

Requires Node.js **20+** and npm:

```sh
git clone https://github.com/sobrdigital/artboard-pdf-exporter.git
cd artboard-pdf-exporter
npm ci
npm run check
```

| Command | Purpose |
| --- | --- |
| `npm test` | Run the targeted automated tests |
| `npm run build` | Bundle the plugin into `dist/` |
| `npm run check` | Run tests, then build |

The suite currently contains **13 tests** covering selection-only filtering, ordering, settings, dimensions, real PDF assembly, transparency masks, runtime compatibility without Node globals, cancellation guards, write errors, empty-output rejection, saved-byte verification, temporary-document isolation, and manifest structure.

A limited real Photoshop export produced a two-page, **394,446-byte** PDF with visible artwork. The saved bytes matched the generated bytes, and source document/history/selection state matched before and after. The PDF reopened with pdf-lib and its first page rendered with macOS's PDF renderer. This is not a claim that the entire integration matrix or Acrobat UI passed.

See [validation notes](validation/RESULTS.md) and the [manual Photoshop checklist](MANUAL_TESTS.md). GitHub Actions also runs the tests and build.

## Limits to understand

- **Raster output:** text and vectors become pixels. Physical page size is `artboard pixels ÷ document PPI × 72` PDF points.
- **Color:** Photoshop converts to 8-bit sRGB. ICC profiles are not embedded, CMYK is not retained, and output is not PDF/X.
- **Sampling:** downsampling uses nearest-neighbor sampling. Use Original for detailed print artwork.
- **Memory:** each source artboard and output raster is capped at 24 megapixels. The full temporary document and assembled PDF also use memory and scratch disk. Export smaller selections for large PSDs.
- **Previews:** thumbnails are generated for the first 50 imported artboards. They read the source composite; export uses the isolated duplicate.
- **Visibility:** selected artboards and ancestor groups are revealed only in the duplicate. Hidden children stay hidden. Unusual effects, nesting, masks, and alternate document modes need further integration coverage.
- **Cancellation:** checked between operations and pages. Synchronous JPEG encoding must finish first. Saving cannot be cancelled once writes start.
- **File failures:** writes are not transactional. A failed write can leave a partial single PDF. Separate files saved before a later failure remain in the destination.
- **Platform coverage:** full Windows, picker, dock/drag, real cancellation, and color-mode tests remain pending.

## Project map

```text
src/
  documentService.js   Artboard discovery and snapshot checks
  model.js             Selection, ordering, settings and dimensions
  main.js              Panel UI and Photoshop-selection sync
  renderSession.js     Temporary duplicate and artboard isolation
  renderService.js     Pixel rendering and thumbnails
  pdfService.js        JPEG/lossless PDF assembly
  exportService.js     Prepare, choose destination, write and verify
  settingsService.js   Local control preferences
scripts/build.js       UXP-compatible bundle and license copying
tests/                 Targeted automated tests
dist/                  Ready-to-load plugin
docs/                  Installation and agent handoff
```

## Working with a coding agent

Use the [copy-and-paste agent prompt](docs/AGENT_PROMPT.md). Project-specific engineering rules are in [AGENTS.md](AGENTS.md).

## Dependencies and ownership

Runtime dependencies are pinned: [pdf-lib 1.17.1](https://pdf-lib.js.org/) and [jpeg-js 0.4.4](https://github.com/jpeg-js/jpeg-js). The build replaces jpeg-js's Node Buffer return with `Uint8Array`; tests exercise the bundled paths without Buffer, fetch, or canvas. Third-party licenses are included in `dist/licenses/`.

This private project is marked `UNLICENSED`. No open-source license is granted for the project itself. Dependency licenses still apply.

References: [Adobe Imaging API](https://developer.adobe.com/photoshop/uxp/2022/ps-reference/media/imaging/), [manifest v5](https://developer.adobe.com/photoshop/uxp/2022/guides/uxp-guide/uxp-misc/manifest-v5/), [developer tools setup](https://developer.adobe.com/uxp/guides/how-to/developer-tools/), and [pdf-lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument).
