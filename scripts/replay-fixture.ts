import { readFileSync } from "fs";
import { resolve } from "path";
import { loadConfig } from "../src/config";
import { BrowserManager } from "../src/runtime/browser-manager";
import { executeWorkflow } from "../src/runtime/execute-workflow";
import { workflowRegistry } from "../src/workflows/registry";

type ReplayFixture = {
  description: string;
  workflow: string;
  params: unknown;
};

function readFixture(pathArg: string | undefined): ReplayFixture {
  if (!pathArg) {
    throw new Error("Usage: npm run replay:fixture -- <fixture-path>");
  }

  const filePath = resolve(process.cwd(), pathArg);
  return JSON.parse(readFileSync(filePath, "utf8")) as ReplayFixture;
}

async function main() {
  const fixture = readFixture(process.argv[2]);
  const workflow = workflowRegistry.get(fixture.workflow);

  if (!workflow) {
    throw new Error(`Unknown workflow in fixture: ${fixture.workflow}`);
  }

  const config = loadConfig();
  const browserManager = new BrowserManager(config.headless);

  try {
    const result = await executeWorkflow({
      workflow,
      params: workflow.parseParams(fixture.params),
      browserManager,
      config,
    });

    console.log(
      JSON.stringify(
        {
          description: fixture.description,
          ...result,
        },
        null,
        2
      )
    );

    if (!result.success) {
      process.exitCode = 1;
    }
  } finally {
    await browserManager.shutdown();
  }
}

main().catch((error) => {
  console.error("Replay failed:", error);
  process.exit(1);
});
