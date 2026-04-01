# Tests

`browserlane` currently relies on script-driven smoke verification instead of a larger automated test suite.

The most important checks today are:
- `npm run check`
- `npm run verify:demo`
- `npm run replay:fixture -- demo/replays/demo-dashboard.json`
- `npm run replay:fixture -- demo/replays/demo-intake.json`

This directory is reserved for future unit and integration tests as the public API surface expands.
