# Contributing to BoardPDF

BoardPDF is a public beta. Focused bug reports, documentation fixes, and small pull requests are welcome.

## Report a bug

Include Photoshop version, OS, document mode/depth, artboard dimensions, selected settings, the panel's exact error, and steps to reproduce. Say whether the issue also occurs in a small test document. Use synthetic artwork; do not share client PSDs or credentials.

## Make a change

1. Fork and clone the repository.
2. Read `AGENTS.md` and the relevant source modules.
3. Run `npm ci`, then implement the smallest complete change.
4. Run `npm run check` and include the updated `dist/` output.
5. For Photoshop behavior, follow the relevant cases in `MANUAL_TESTS.md`.
6. Open a pull request explaining the trigger, changed behavior, tests actually executed, and remaining host-validation work.

Keep the selection-only workflow, compact panel, offline operation, and source-document protection intact. Do not replace real exports with mocked success or claim an unexecuted host test passed.

Changes must be compatible with the MIT License. By submitting a contribution, you agree that it may be distributed under this repository's MIT License. Retain dependency notices and do not submit material you are not authorized to share.
