# Architecture

`browserlane` is a small service-oriented browser runner with four main layers:

1. `src/server.ts`
   Fastify HTTP entry point, auth enforcement, workflow lookup, and concurrency protection.
2. `src/runtime/browser-manager.ts`
   Shared Chromium lifecycle with isolated contexts per run.
3. `src/runtime/execute-workflow.ts` and `src/runtime/workflow-recorder.ts`
   Execution orchestration, artifact creation, screenshots, traces, and run summaries.
4. `src/workflows/*`
   Safe example workflows that demonstrate how a user should extend the repo.

## Execution Flow

1. The caller sends a bearer-authenticated request to `POST /workflows/:name`.
2. The server parses workflow params and checks the workflow registry.
3. A shared browser process creates a fresh isolated context for the run.
4. The recorder creates a run directory and enables Playwright tracing.
5. The workflow executes and writes step screenshots plus structured metadata.
6. The response includes success/failure along with artifact paths.

## Why This Shape

The repo is meant to be easy to adapt:
- auth policy is isolated
- browser lifecycle is isolated
- workflows are isolated
- artifact handling is isolated

That separation lets someone swap in their own workflow without having to unravel the runner internals first.
