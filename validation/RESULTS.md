# Limited real Photoshop validation

Date: 2026-10-29. Host: Photoshop 27.11.0, UXP 9.4.1, macOS on Apple Silicon.

Executed through Adobe UDT's local service and UXP debugger:

- Plugin load/reload and panel initialization.
- Real thumbnail generation. At least 33 thumbnail URLs were present during a check of the 46-artboard active document. Export waits for any in-flight thumbnail modal before opening its own scope.
- Two-page JPEG PDF from an active multi-artboard PSD, using two populated artboards. This reverses their original relative discovery order. Both artboards contain visible artwork.
- One temporary document duplicate, with unrelated layers hidden only in the duplicate. The duplicate closed after rendering.
- Actual UXP binary file write followed by byte-for-byte readback verification.
- Local test output (not committed): 394,446 bytes, two pages at 1080 × 1440 PDF points each (source resolution 72 PPI).
- The original document ID, history-state ID, open-document count, and selected-layer IDs matched before and after the successful export.
- The generated file reopened with pdf-lib. macOS `sips` rendered its first page to a PNG preview (not committed). Visual inspection confirmed the page contains the source artwork.

Not executed: Acrobat UI validation, full picker flow after this fix, Windows, full manual matrix, large-document stress, mixed page sizes in the real host, or cancellation during a real duplicate/render. These remain integration tasks. Unit tests cover the relevant assembly, selection, settings, padding, cancellation guards, file failures, empty-output rejection, byte verification, and duplicate isolation logic with mocked host boundaries.

No original PSD file was saved or overwritten. Diagnostic files were written to local temporary storage for inspection. Generated client artwork is excluded from the repository; this file contains only sanitized validation notes.

## Selection-only panel check

After the selection-only UI update, the actual host reported 46 detected artboards, zero selected Photoshop layers, zero displayed rows, an empty state, and Options collapsed. This verifies that the panel no longer imports all artboards when nothing is selected. Automated tests also cover filtering to a subset and preserving order for retained selected IDs.

## Public-beta branding and controls

On 2026-10-30, the source and bundled build were updated for BoardPDF branding, compact controls, drag feedback, and panel-only Clear all / Remove. The existing 13-test suite and build pass. These new UI changes have not yet received a complete visual Photoshop check.
