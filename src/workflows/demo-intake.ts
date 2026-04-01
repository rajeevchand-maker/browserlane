import { renderFormHtml } from "./demo-pages";
import type { WorkflowDefinition, WorkflowResult, WorkflowRuntime } from "./types";

type IntakeParams = {
  owner: string;
  priority: "standard" | "priority";
};

function parseParams(params: unknown): IntakeParams {
  const input = params && typeof params === "object" ? (params as Record<string, unknown>) : {};
  const owner = typeof input.owner === "string" && input.owner.trim() ? input.owner : "Alex Rivera";
  const priority = input.priority === "priority" ? "priority" : "standard";
  return { owner, priority };
}

async function runIntakeWorkflow(runtime: WorkflowRuntime, params: IntakeParams): Promise<WorkflowResult> {
  const page = await runtime.browserContext.newPage();
  runtime.recorder.attachPage(page);

  try {
    await runtime.recorder.step("render intake form", page, async () => {
      await page.setContent(renderFormHtml(), { waitUntil: "load" });
      await page.getByRole("heading", { name: "Launch browser workflow" }).waitFor({ state: "visible" });
    });

    await runtime.recorder.step("submit synthetic workflow request", page, async () => {
      await page.getByLabel("Workflow owner").fill(params.owner);
      await page.getByLabel("Priority").selectOption(params.priority);
      await page.getByRole("button", { name: "Create safe run" }).click();
      await page.getByRole("heading", { name: "Workflow created" }).waitFor({ state: "visible" });
    });

    const message = await page.locator("#success-copy").textContent();
    const screenshot = await runtime.recorder.captureArtifact(page, "intake-confirmation");

    return {
      success: true,
      data: {
        owner: params.owner,
        priority: params.priority,
        message,
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

export const demoIntakeWorkflow: WorkflowDefinition<IntakeParams> = {
  name: "demo-intake",
  description: "Submit a synthetic workflow request form and verify the success confirmation state.",
  replayFixture: "demo/replays/demo-intake.json",
  parseParams,
  run: runIntakeWorkflow,
};
