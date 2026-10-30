# Agent handoff prompt

Copy this prompt into your coding agent after attaching or cloning this repository. Replace the task line with the change you want.

```text
Work on the public, MIT-licensed sobrdigital/boardpdf repository.

Task: [Describe the specific feature, fix, or installation issue here.]

First read AGENTS.md, README.md, docs/INSTALLATION.md, the relevant source modules,
and validation/RESULTS.md. Inspect the current state before changing anything.
Follow existing project instructions. Keep changes small and runnable.

This is BoardPDF by SOBR, an MIT-licensed Adobe Photoshop UXP panel. Photoshop is not Node.js or a full browser.
Runtime work stays offline, without external services, API keys or helper binaries.
The committed dist folder must remain ready to load through UXP Developer Tool.

Required behavior:
- Only Photoshop-selected artboards appear in the panel and thumbnail queue.
- Selected child layers resolve to their parent artboard.
- An empty Photoshop selection means an empty list.
- Preserve user page order for retained selected IDs.
- Keep the interface compact, with orange/black/white branding and secondary controls under Options.
- Keep Clear all and Remove local to the plugin list. Sync restores the Photoshop selection.
- Export only checked pages, in the exact displayed order.
- Never mutate or close the original PSD.
- Render via a private temporary duplicate and close only that duplicate safely.
- Use executeAsModal for pixel reads and temporary-document mutations.
- Read composite pixels, not artboard group pixels, through Imaging API.
- Finish PDF generation before opening the destination picker.
- Reject invalid/empty output and verify written bytes before success.
- Never silently overwrite files or claim an unexecuted Photoshop test passed.

Known host pitfalls:
- Artboard group getPixels requests fail with Unsupported layer type.
- getPixels and thumbnail reads require modal scope in the tested host.
- addNotificationListener may return void.
- Await any thumbnail modal before starting export.
- Duplicated documents can have different layer IDs.
- Use dist/manifest.json for installation, not the root source manifest.
- UDT and Photoshop both need Developer Mode, and Photoshop may need a full restart.

Implement the requested change, run npm run check, inspect the built output,
and update docs if behavior or setup changes. Use targeted tests for actual risks.
If Photoshop is available and authorized, run a limited real-host check and record
its exact scope. Otherwise provide precise manual steps without claiming success.
Never commit private PSDs, exported client artwork, credentials, or logs.

At completion report the change, files affected, tests actually executed,
remaining limitations, and any user action needed to load or verify the build.
Do not stop at a scaffold or plan when the task is executable.
```
