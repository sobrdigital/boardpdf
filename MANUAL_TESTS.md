# Photoshop integration checklist

Status: limited real-host checks were executed on Photoshop 27.11.0/macOS, recorded in `validation/RESULTS.md`. The full matrix below remains pending. Record Photoshop version, OS, document mode/depth, pass/fail, and console errors for each case. Use disposable PSD fixtures and a new export destination. Keep the original saved file for comparison.

1. Single artboard: add a colored rectangle and text. Export JPEG PDF. Check one page, correct crop, aspect ratio and physical size.
2. Multiple artboards: use labels A, B, C, D. Order D, B, A, C. Uncheck A. Expect D, B, C, with page numbers 1–3. Verify the Photoshop layer order and artboard positions stay unchanged.
3. Duplicate names: name two artboards identically. Export separately. Check distinct ID-suffixed filenames and correct contents.
4. Dimensions/orientation: use square, portrait and landscape artboards, including negative canvas coordinates. Check each PDF MediaBox and artwork orientation, with no neighboring artwork.
5. Hidden/locked: include hidden children, a locked visible child, clipped content, adjustment layers, masks, shadows and a hidden artboard. Verify rendered results against Photoshop. Record hidden-artboard behavior rather than assuming it is revealed.
6. Transparency: set artboard background transparent, put semi-transparent artwork near an edge, and leave empty margins. Export lossless. Place the PDF over a colored background in a viewer/editor supporting alpha. Check empty margins and soft edges. Export JPEG with white and #112233 backgrounds and compare.
7. No document: close all documents. Expect an empty panel and disabled export. Open an unsaved artboard document. Expect export without a PSD save prompt. Open an ordinary document without artboards. Expect an empty list and disabled export.
8. Stale state: move, rename, add, delete, hide or repaint a layer, then undo/redo. Switch or close the document. Export should require Update selection or reject the stale snapshot. Verify the export modal blocks source edits.
9. Cancellation: cancel destination picking, cancel between large pages, and cancel through Photoshop's modal progress UI. No destination files should be written before commit. The source must remain open and unchanged. File writes already underway cannot be cancelled.
10. Write errors: choose a protected or read-only directory and test full-disk behavior on a test volume. Check useful error text, cleanup of the incomplete separate file, and count of previously saved files.
11. Existing files: choose an existing single PDF and cancel replacement in the native picker. Ensure it is unchanged. In separate mode use a colliding filename. Expect rejection without overwriting any file.
12. Many artboards: use at least 100 small artboards. Scroll, toggle, reorder, select a subset in Photoshop and confirm only that subset appears. Check the first-50 thumbnail cap. Try an artboard above 24 megapixels and verify explicit rejection. Monitor memory in UDT.
13. Unicode: use Hindi, Japanese, Arabic and accented names. Verify panel text and separate filenames. Check Windows reserved punctuation is sanitized.
14. Compression: export the same photo-heavy artwork at all presets. Check image dimensions against the selected DPI and document resolution. Check quality 1 and 100, Original DPI, Custom, and persistence after reload. File size need not decrease for every synthetic image.
15. Color: test RGB, grayscale, CMYK, 16-bit and 32-bit documents. Confirm Photoshop accepts sRGB/8-bit conversion; compare colors and document any HDR conversion behavior. Check that the source mode/depth/profile remain unchanged.
16. Dock/reload: dock and resize to minimum width. Test keyboard focus, checkbox activation, the Move up / Move down toolbar and drag fallback on both operating systems. Reload through UDT. Confirm settings persist and document discovery reruns.
17. Source integrity: after each export, compare saved PSD hash where practical, history-state count, active document, layer visibility, selection, lock state, and positions. No document mutation should occur.
18. Package: package through UDT, install `.ccx` on a clean machine and repeat cases 1, 2, 6, 9 and 11 without network access.
