import { mkdirSync, writeFileSync } from "fs";
import { join, relative } from "path";
import type { BrowserContext, Page } from "playwright";
import type { WorkflowResult } from "../workflows/types";

type ConsoleEntry = {
  level: string;
  text: string;
};

type StepRecord = {
  name: string;
  status: "ok" | "fail";
  durationMs: number;
  pageUrl?: string;
  screenshot?: string;
  error?: string;
  bodyPreview?: string;
};

export interface WorkflowArtifactsSummary {
  runId: string;
  runDirectory: string;
  logFile: string;
  requestFile: string;
  screenshotFiles: string[];
  traceFile?: string;
}

type WorkflowRunLog = {
  workflow: string;
  runId: string;
  startedAt: string;
  durationMs: number;
  params: unknown;
  success: boolean;
  error?: string;
  steps: StepRecord[];
  consoleEntries: ConsoleEntry[];
  screenshotFiles: string[];
  traceFile?: string;
  notes: string[];
  result?: Record<string, unknown>;
};

export class WorkflowRecorder {
  readonly runId: string;
  private readonly runDir: string;
  private readonly runDirectory: string;
  private readonly startedAt = new Date();
  private readonly steps: StepRecord[] = [];
  private readonly consoleEntries: ConsoleEntry[] = [];
  private readonly screenshotFiles: string[] = [];
  private readonly notes: string[] = [];
  private traceFile?: string;

  constructor(
    private readonly workflow: string,
    artifactRoot: string,
    private readonly params: unknown
  ) {
    const dateStamp = this.startedAt.toISOString().slice(0, 10);
    const timeStamp = this.startedAt.toISOString().slice(11, 19).replace(/:/g, "-");
    const suffix = Math.random().toString(36).slice(2, 6);
    this.runId = `${workflow}_${timeStamp}_${suffix}`;
    this.runDir = join(artifactRoot, dateStamp, this.runId);
    this.runDirectory = relative(process.cwd(), this.runDir);

    mkdirSync(this.runDir, { recursive: true });
    this.writeJson("request.json", {
      workflow: this.workflow,
      params: this.params,
      startedAt: this.startedAt.toISOString(),
    });
  }

  attachPage(page: Page): void {
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        this.consoleEntries.push({
          level: message.type(),
          text: message.text().slice(0, 500),
        });
      }
    });

    page.on("pageerror", (error) => {
      this.consoleEntries.push({
        level: "pageerror",
        text: String(error).slice(0, 500),
      });
    });
  }

  note(message: string): void {
    this.notes.push(message);
  }

  async startTrace(browserContext: BrowserContext): Promise<void> {
    await browserContext.tracing.start({ screenshots: true, snapshots: true });
    this.note("Playwright tracing enabled for this run.");
  }

  async stopTrace(browserContext: BrowserContext): Promise<void> {
    const tracePath = join(this.runDir, "trace.zip");
    await browserContext.tracing.stop({ path: tracePath });
    this.traceFile = "trace.zip";
  }

  async step(name: string, page: Page, fn: () => Promise<void>): Promise<void> {
    const startedAt = Date.now();

    try {
      await fn();
      const screenshot = await this.captureScreenshot(page, `${this.steps.length + 1}-ok`);
      this.steps.push({
        name,
        status: "ok",
        durationMs: Date.now() - startedAt,
        pageUrl: page.url(),
        screenshot,
      });
    } catch (error) {
      const screenshot = await this.captureScreenshot(page, `${this.steps.length + 1}-fail`);
      this.steps.push({
        name,
        status: "fail",
        durationMs: Date.now() - startedAt,
        pageUrl: page.url(),
        screenshot,
        error: error instanceof Error ? error.message : "Unknown step failure",
        bodyPreview: await this.readBodyPreview(page),
      });
      throw error;
    }
  }

  async captureArtifact(page: Page, label: string): Promise<string | undefined> {
    return this.captureScreenshot(page, label);
  }

  finalize(result: WorkflowResult): WorkflowArtifactsSummary {
    const log: WorkflowRunLog = {
      workflow: this.workflow,
      runId: this.runId,
      startedAt: this.startedAt.toISOString(),
      durationMs: Date.now() - this.startedAt.getTime(),
      params: this.params,
      success: result.success,
      ...(result.success ? { result: result.data } : { error: result.error, result: result.data }),
      steps: this.steps,
      consoleEntries: this.consoleEntries,
      screenshotFiles: this.screenshotFiles,
      ...(this.traceFile ? { traceFile: this.traceFile } : {}),
      notes: this.notes,
    };

    this.writeJson("run.json", log);

    return {
      runId: this.runId,
      runDirectory: this.runDirectory,
      logFile: join(this.runDirectory, "run.json"),
      requestFile: join(this.runDirectory, "request.json"),
      screenshotFiles: this.screenshotFiles.map((file) => join(this.runDirectory, file)),
      ...(this.traceFile ? { traceFile: join(this.runDirectory, this.traceFile) } : {}),
    };
  }

  private async captureScreenshot(page: Page, label: string): Promise<string | undefined> {
    const filename = `${label}.png`;

    try {
      await page.screenshot({
        path: join(this.runDir, filename),
        fullPage: true,
      });
      this.screenshotFiles.push(filename);
      return filename;
    } catch {
      return undefined;
    }
  }

  private async readBodyPreview(page: Page): Promise<string | undefined> {
    try {
      const text = await page.textContent("body");
      return text?.slice(0, 500);
    } catch {
      return undefined;
    }
  }

  private writeJson(filename: string, value: unknown): void {
    writeFileSync(join(this.runDir, filename), JSON.stringify(value, null, 2) + "\n");
  }
}
