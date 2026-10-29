# Installation and updates

## What you need

- macOS or Windows with Photoshop 25.0 or later.
- Adobe UXP Developer Tool (UDT).
- Permission to enable development loading. Adobe's Developer Mode setup may request administrator approval.
- The extracted repository, including its complete `dist/` folder.

The plugin runs offline after setup. Installing Adobe tools may require Creative Cloud and an Adobe sign-in. You do not need Node.js, npm, a terminal, or an API key to load the included build.

## 1. Get the files

For this private repository, sign into a GitHub account with access. Open the repository, choose **Code → Download ZIP**, and extract it to a permanent folder.

Alternatively:

```sh
git clone https://github.com/sobrdigital/artboard-pdf-exporter.git
```

Do not move or delete the plugin folder after registering it in UDT. UDT loads the files from that location.

## 2. Install Adobe's development tool

Open [Adobe's direct UXP Developer Tools page](https://creativecloud.adobe.com/apps/download/uxp-developer-tools). Sign in if asked and let the page open Creative Cloud. Install **UXP Developer Tools**.

If searching in Creative Cloud, use **Apps → All apps**, not the Plugins marketplace. If the tool is unavailable for a managed account, contact the account administrator. See [Adobe's setup instructions](https://developer.adobe.com/uxp/guides/how-to/developer-tools/).

Launch UDT and accept its **Enable Developer Mode** prompt. Approve the OS permissions yourself if requested.

## 3. Enable Photoshop development loading

1. Save your open documents.
2. Open Photoshop's preferences/settings, then **Plugins**. On Windows, start under **Edit → Preferences**.
3. Enable **Enable Developer Mode**.
4. Quit Photoshop completely, then reopen it. On macOS use **Cmd+Q**, not just closing a document window.
5. Keep Photoshop running while loading from UDT.

## 4. Register and load

1. Open UXP Developer Tool.
2. Choose **Add Plugin**.
3. Navigate into the extracted project, then into **dist**.
4. Select **`dist/manifest.json`**.
5. Click **Load** for Artboard PDF Exporter.
6. If needed, open **Plugins → Artboard PDF Exporter** in Photoshop.
7. Drag the panel tab into a Photoshop dock if you want it docked.

**Use the manifest inside `dist`.** The root manifest belongs to the development sources and does not have a sibling compiled runtime. Keep `main.js`, `index.html`, `styles.css`, and `licenses/` together inside `dist`.

## 5. First export

1. Open a PSD containing actual Photoshop artboards.
2. In Photoshop, select two artboards. You may also select layers inside them.
3. Wait for the panel to show only those selected artboards. An empty Photoshop selection produces an empty panel.
4. Click **Update selection** if necessary.
5. Click a thumbnail row, then **Move up** or **Move down**, or drag rows to reorder pages. Page numbers show the final checked-page order.
6. Set **Compression** and **Resolution**.
7. Open **Options** if you need separate PDFs, a filename suggestion, custom JPEG quality, transparency, or background color.
8. Click **Export**. Rendering happens before the destination picker opens.
9. For a multipage PDF, choose a new filename. For separate PDFs, choose an empty writable folder.
10. Wait for the panel to report the saved count and size. Open the PDF and inspect the pages.

The plugin's filename control is a suggestion for the native save picker. You can change the final name in that picker. Separate filenames are generated from page number, artboard name, and artboard ID.

## Update an existing installation

For a clone, run `git pull`. For a ZIP download, replace the project with the newer extracted version.

- Same folder and unchanged manifest: use **Reload** in UDT.
- Changed manifest or moved folder: remove the old UDT entry, add the new `dist/manifest.json`, and Load again. Removing the entry does not delete your project.
- Changes to `src`, `index.html`, `styles.css`, or the root manifest: run `npm ci` if dependencies changed, then `npm run check`. Reload after the build.

## Package a .ccx

No packaged `.ccx` is included in this repository.

1. Run `npm ci` and `npm run check`.
2. Complete the relevant cases in [MANUAL_TESTS.md](../MANUAL_TESTS.md).
3. In UDT, register the built **`dist/manifest.json`**.
4. Use its **Package** command and choose an output location.
5. Install the generated `.ccx` on a clean test machine and verify it in Photoshop.

Package `dist`, not the development directory. Do not rename a ZIP to `.ccx`. Obtain the Adobe-issued plugin ID and complete the Adobe distribution requirements appropriate to your distribution route. The repository's current ID is for development.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Validation passes, Load fails | Enable Developer Mode in both UDT and Photoshop, restart Photoshop completely, then reload. Confirm the selected manifest is inside `dist`. |
| Empty artboard list | Select artboards or child layers in Photoshop. This is a selection-only panel, not a browser of every artboard. Click Update selection. |
| Export disabled after editing | Click Update selection to refresh the document snapshot. Check at least one imported row. |
| Old UI still appears | Build the sources, then Reload in UDT. Verify UDT points to the intended project's `dist`. |
| Missing or failed thumbnails | Wait for Photoshop to finish its current operation, then Update selection. Only the first 50 imported artboards get previews. |
| Unsupported layer type | You may be running an old build. Current export reads the isolated document composite, not an artboard group as a pixel layer. Rebuild and reload. |
| Empty or unreadable PDF from an older build | Export again to a new filename using the current build. It renders before opening the picker and verifies saved bytes. Keep any error message from the panel. |
| Artboard too large | The source artboard is capped at 24 megapixels even when downsampling. Reduce source dimensions. Selecting fewer pages helps total memory use. |
| Cannot write files | Try a writable local folder. Check permissions and disk space. Separate mode rejects filenames that already exist. |
| Dragging does nothing | Click the row and use Move up / Move down. |
| Small text looks rough after downsampling | Use Original resolution. Current downsampling uses nearest-neighbor sampling. |
| Printed color differs | Output is sRGB raster data without embedded ICC profiles. It is not a PDF/X or CMYK proof. |
| Cancel responds slowly | Synchronous JPEG encoding must finish before cancellation is checked. Writes already underway cannot be cancelled. |

For a reproducible issue, record Photoshop version, OS, document mode/depth, selected artboard dimensions, export settings, the panel message, and the UDT console error. Do not upload client PSDs or artwork without permission.

## Remove the development plugin

Unload it and remove its entry in UDT. Keep or delete the local project folder as needed. This does not delete exported PDFs or your source PSDs.
