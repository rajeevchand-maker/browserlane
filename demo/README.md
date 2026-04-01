# Demo Assets

This directory holds the demo-safe materials that make `browserlane` explainable without access to private sites.

## Replay Fixtures

- `replays/demo-dashboard.json`
  Synthetic input for the `demo-dashboard` workflow. Run it with:

  ```bash
  npm run replay:fixture -- demo/replays/demo-dashboard.json
  ```

- `replays/demo-intake.json`
  Synthetic input for the `demo-intake` workflow. Run it with:

  ```bash
  npm run replay:fixture -- demo/replays/demo-intake.json
  ```

Each replay writes a fresh run directory under `artifacts/runs/<date>/<run-id>/` with:
- `request.json`
- `run.json`
- one or more screenshots
- `trace.zip`

## Launch Assets

- `browserlane-run-poster.svg`
  A repo-safe overview visual for README or launch docs.
- `browserlane-social-preview.svg`
  Suggested GitHub social preview image.
- `browserlane-dashboard-real.png`
  Demo-safe replay capture from the synthetic dashboard workflow.
- `browserlane-intake-real.png`
  Demo-safe replay capture from the synthetic intake workflow.
- `browserlane-run-review.html`
  Static showcase page built from the committed replay artifacts.
- `browserlane-run-review.png`
  Screenshot capture used in the top-level README.

## Safety Rules

- no screenshots from private websites
- no copied HAR files from private systems
- no real cookies, tokens, selectors, or URLs
- no machine-specific deployment notes or screenshots
