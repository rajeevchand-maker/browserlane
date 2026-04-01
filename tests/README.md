# Tests

`browserlane` now pairs script-driven demo verification with targeted automated
coverage around the service logic that most affects trust.

Automated checks:
- `npm run test`
- `npm run check`

Script-driven verification:
- `npm run verify:demo`
- `npm run replay:fixture -- demo/replays/demo-dashboard.json`
- `npm run replay:fixture -- demo/replays/demo-intake.json`

Current unit coverage focuses on:
- demo token signing and verification
- registry listing for bundled workflows
- workflow execution success and failure behavior
- workflow-recorder artifact output for success and failure steps
