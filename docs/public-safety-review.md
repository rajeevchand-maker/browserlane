# Public Safety Review

Date: 2026-03-28

This review tracks the conditions required before the repo is promoted more broadly.

## Safe

- Workflow targets are synthetic HTML generated in-repo.
- Example data uses invented names and neutral business context.
- `.env.example` contains only generic local configuration.
- Run artifacts are written locally and ignored by git.
- No private screenshots or copied HAR files are committed.
- No tunnel, launch agent, or machine-specific deployment setup is documented.

## Excluded On Purpose

- real institution-specific or single-tenant workflows
- private selectors or URLs
- auth cookies, tokens, or HAR captures
- single-machine deployment notes
- cloudflared or public exposure setup

## Public Flip Checklist

- review all committed assets in `demo/` and `docs/`
- confirm `artifacts/` is still gitignored and empty in the repo
- confirm no private names or URLs were added during pre-release work
- set a social preview image before launch
- complete the checklist before launch
