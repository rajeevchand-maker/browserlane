import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BrowserlaneConfig } from "../src/config";
import { executeWorkflow } from "../src/runtime/execute-workflow";
import { WorkflowRecorder } from "../src/runtime/workflow-recorder";
import type { WorkflowDefinition } from "../src/workflows/types";

const cleanupPaths: string[] = [];

function createTempRoot(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  cleanupPaths.push(root);
  return root;
}

function createConfig(artifactDir: string): BrowserlaneConfig {
  return {
    port: 3100,
    headless: true,
    jwtSecret: "browserlane-demo-secret",
    jwtIssuer: "browserlane-local",
    jwtAudience: "browserlane",
    artifactDir,
  };
}

function createFakePage(url: string) {
  return {
    url: () => url,
    screenshot: vi.fn(async ({ path }: { path: string }) => {
      writeFileSync(path, "fake image bytes");
    }),
    textContent: vi.fn(async () => "Synthetic browser body preview"),
    on: vi.fn(),
  };
}

afterEach(() => {
  while (cleanupPaths.length > 0) {
    rmSync(cleanupPaths.pop()!, { recursive: true, force: true });
  }
});

describe("executeWorkflow", () => {
  it("records successful workflow runs and writes request, log, and trace artifacts", async () => {
    const artifactDir = createTempRoot("browserlane-execution-");
    const tracing = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async ({ path }: { path: string }) => {
        writeFileSync(path, "trace");
      }),
    };
    const browserContext = { tracing } as never;
    const browserManager = {
      runIsolated: vi.fn(async (fn: (context: unknown) => Promise<unknown>) => await fn(browserContext)),
    };

    const workflow: WorkflowDefinition<{ project: string }> = {
      name: "synthetic-check",
      description: "Verify a synthetic workflow.",
      parseParams(params) {
        return params as { project: string };
      },
      async run({ recorder }, params) {
        recorder.note(`Verified ${params.project}`);
        return {
          success: true,
          data: {
            project: params.project,
            status: "ok",
          },
        };
      },
    };

    const result = await executeWorkflow({
      workflow,
      params: { project: "northstar-api" },
      browserManager: browserManager as never,
      config: createConfig(artifactDir),
    });

    expect(result.workflow).toBe("synthetic-check");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ project: "northstar-api", status: "ok" });
    expect(result.artifacts.traceFile).toBeDefined();
    expect(existsSync(resolve(process.cwd(), result.artifacts.requestFile))).toBe(true);
    expect(existsSync(resolve(process.cwd(), result.artifacts.logFile))).toBe(true);
    expect(tracing.start).toHaveBeenCalledTimes(1);
    expect(tracing.stop).toHaveBeenCalledTimes(1);

    const runLog = JSON.parse(readFileSync(resolve(process.cwd(), result.artifacts.logFile), "utf8")) as {
      success: boolean;
      notes: string[];
      result: Record<string, unknown>;
    };

    expect(runLog.success).toBe(true);
    expect(runLog.notes).toContain("Verified northstar-api");
    expect(runLog.result).toEqual({ project: "northstar-api", status: "ok" });
  });

  it("returns a failure result and still writes artifacts when execution throws before a workflow result", async () => {
    const artifactDir = createTempRoot("browserlane-failure-");
    const browserManager = {
      runIsolated: vi.fn(async () => {
        throw new Error("Browser disconnected");
      }),
    };

    const workflow: WorkflowDefinition<Record<string, never>> = {
      name: "failing-check",
      description: "Fail before workflow execution begins.",
      parseParams(params) {
        return params as Record<string, never>;
      },
      async run() {
        return { success: true, data: {} };
      },
    };

    const result = await executeWorkflow({
      workflow,
      params: {},
      browserManager: browserManager as never,
      config: createConfig(artifactDir),
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected workflow execution to fail.");
    }
    expect(result.error).toBe("Browser disconnected");
    expect(result.artifacts.traceFile).toBeUndefined();
    expect(existsSync(resolve(process.cwd(), result.artifacts.requestFile))).toBe(true);
    expect(existsSync(resolve(process.cwd(), result.artifacts.logFile))).toBe(true);

    const runLog = JSON.parse(readFileSync(resolve(process.cwd(), result.artifacts.logFile), "utf8")) as {
      success: boolean;
      error?: string;
    };

    expect(runLog.success).toBe(false);
    expect(runLog.error).toBe("Browser disconnected");
  });
});

describe("WorkflowRecorder", () => {
  it("captures step screenshots and failure details in the final run log", async () => {
    const artifactDir = createTempRoot("browserlane-recorder-");
    const recorder = new WorkflowRecorder("synthetic-flow", artifactDir, { mode: "test" });
    const page = createFakePage("https://example.test/dashboard");

    await recorder.step("load dashboard", page as never, async () => {});

    await expect(
      recorder.step("verify tile", page as never, async () => {
        throw new Error("Metric tile missing");
      }),
    ).rejects.toThrow("Metric tile missing");

    const summary = recorder.finalize({
      success: false,
      error: "Metric tile missing",
    });

    expect(summary.screenshotFiles).toHaveLength(2);
    expect(summary.screenshotFiles.every((file) => existsSync(resolve(process.cwd(), file)))).toBe(true);

    const runLog = JSON.parse(readFileSync(resolve(process.cwd(), summary.logFile), "utf8")) as {
      steps: Array<{ status: string; error?: string; bodyPreview?: string }>;
      screenshotFiles: string[];
    };

    expect(runLog.steps[0]).toMatchObject({ status: "ok" });
    expect(runLog.steps[1]).toMatchObject({
      status: "fail",
      error: "Metric tile missing",
      bodyPreview: "Synthetic browser body preview",
    });
    expect(runLog.screenshotFiles).toHaveLength(2);
  });
});
