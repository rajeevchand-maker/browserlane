# Release Readiness

Date: 2026-03-28

## Checks Run During Pre-Release Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run verify:demo`
- `npm run replay:fixture -- demo/replays/demo-dashboard.json`
- `npm run replay:fixture -- demo/replays/demo-intake.json`

## Repo Readiness

- authenticated runner core exists
- artifact and replay path exists
- two example workflows exist
- license, contributing guide, and security policy exist
- CI workflow exists
- public-safety review exists

## Before Wider Launch

- add screenshots or a social preview in GitHub settings
- tag the first release
- do one final privacy review of README, docs, and demo assets
