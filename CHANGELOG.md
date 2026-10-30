# Changelog

## 1.1.0 Public Beta

- Introduced BoardPDF by SOBR branding with orange, black, and white UI assets.
- Reduced button and control sizes to leave more room for page arranging.
- Added drag handles and drop-position feedback.
- Moved Options into an overlay that does not shrink the artboard list.
- Added Clear all and Remove for clearing panel rows without changing the PSD.
- Preserved the existing plugin ID and local preferences for development installs.
- Updated installation instructions and agent handoff for the public repository.
- Released the current project under MIT.

The source/build test suite passes 13 targeted tests. Earlier limited real-host checks are documented in `validation/RESULTS.md`. New UI controls, Windows, and the complete integration matrix remain pending manual validation.

## 1.0.0 Internal Prototype

Implemented selection-only artboard discovery, ordering, raster PDF assembly, compression, transparency, temporary-document isolation, and saved-byte verification. Distributed privately during development.
