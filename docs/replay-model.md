# Replay Model

`browserlane` is designed to make browser workflows inspectable, not just executable.

Every workflow run writes a dated artifact directory under `artifacts/runs/` with:
- `request.json`
- `run.json`
- step screenshots
- `trace.zip`

## How Replay Works

1. A fixture file in `demo/replays/` names a workflow and its safe parameters.
2. `scripts/replay-fixture.ts` loads that fixture and runs the workflow through the same execution path the HTTP service uses.
3. The workflow writes artifacts that can be inspected locally or attached to bug reports.

## Why This Exists

The public repo should demonstrate how to debug browser automation without exposing private sites, selectors, or recorded traffic.

Synthetic pages are enough to show:
- authenticated execution
- step-level screenshots
- trace capture
- repeatable local replays

## Current Fixtures

- `demo/replays/demo-dashboard.json`
  Replays the synthetic dashboard workflow and highlights artifact velocity.
- `demo/replays/demo-intake.json`
  Replays the synthetic request form workflow and verifies the success state after submission.
