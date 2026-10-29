# Project instructions

- Never use em dashes in prose.
- Keep the implementation offline and self-contained. No cloud services or runtime network permissions.
- This is Adobe Photoshop UXP, not Node.js or a full browser. Node is build/test only. Bundle third-party code and verify executed runtime paths without Node globals.
- Use DOM APIs where possible. Use batchPlay only for missing host functionality. Photoshop pixel reads and all temporary-document mutations belong inside executeAsModal.
- Never edit, close, save, crop, flatten, or reorder the original document. Isolate only in a private duplicate, close it in finally, and register host cleanup.
- The panel shows only Photoshop-selected artboards, including parent artboards of selected child layers. No selection means no rows or thumbnails. Preserve the relative page order of retained selected IDs.
- Keep the UI compact. Main controls are Compression, Resolution, and Export. Secondary controls stay under Options. Avoid additional toolbars, badges, decoration, and repeated instructions.
- Generate PDFs before opening the destination picker. Reject empty/invalid bytes. Verify saved bytes before reporting success. Never overwrite separate files; single replacement requires the native save picker confirmation.
- Preserve stable source artboard IDs. Do not identify artboards by name. IDs can change in a duplicate, so resolve source IDs to layer paths.
- Do not pass an artboard/group ID to getPixels. The tested host rejects it. Read the isolated temporary document composite.
- Thumbnail work must finish before export enters modal scope. Dispose every PhotoshopImageData in finally.
- UXP addNotificationListener can return void. Do not call .catch directly on its return.
- Run npm run check after changes. Update the committed dist build with source changes. Add targeted regression tests for concrete failures.
- Record exactly which Photoshop checks ran. Unit mocks are not integration tests. Do not claim Windows, Acrobat, or the full manual matrix passed without executing them.
- Never commit node_modules, credentials, logs, PSDs, or generated client artwork. Only sanitized validation notes belong in Git.
- Read README.md, docs/INSTALLATION.md, and validation/RESULTS.md before changing installation or compatibility claims.
