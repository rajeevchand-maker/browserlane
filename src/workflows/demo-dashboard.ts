import { renderDashboardHtml } from "./demo-pages";
import type { WorkflowDefinition, WorkflowResult, WorkflowRuntime } from "./types";

type DashboardParams = {
  emphasis: string;
};

function parseParams(params: unknown): DashboardParams {
  const input = params && typeof params === "object" ? (params as Record<string, unknown>) : {};
  const emphasis = typeof input.emphasis === "string" && input.emphasis.trim() ? input.emphasis : "agent throughput";
  return { emphasis };
}

async function runDashboardWorkflow(runtime: WorkflowRuntime, params: DashboardParams): Promise<WorkflowResult> {
  const page = await runtime.browserContext.newPage();
  runtime.recorder.attachPage(page);

  try {
    await runtime.recorder.step("render synthetic dashboard", page, async () => {
      await page.setContent(renderDashboardHtml(params.emphasis), { waitUntil: "load" });
      await page.getByRole("heading", { name: "Quarterly Operations Console" }).waitFor({ state: "visible" });
    });

    let callout: string | null = null;

    await runtime.recorder.step("inspect emphasis callout", page, async () => {
      callout = await page.locator("#callout").textContent();
      if (!callout) {
        throw new Error("Expected workflow callout to be visible.");
      }
    });

    const screenshot = await runtime.recorder.captureArtifact(page, "dashboard-overview");

    return {
      success: true,
      data: {
        headline: "Quarterly Operations Console",
        emphasis: params.emphasis,
        callout,
        screenshot,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown browser execution error",
    };
  } finally {
    await page.close().catch(() => {});
  }
}

export const demoDashboardWorkflow: WorkflowDefinition<DashboardParams> = {
  name: "demo-dashboard",
  description: "Render a synthetic operations dashboard and verify a headline plus emphasis callout.",
  replayFixture: "demo/replays/demo-dashboard.json",
  parseParams,
  run: runDashboardWorkflow,
};
