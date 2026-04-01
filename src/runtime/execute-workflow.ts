import type { BrowserlaneConfig } from "../config";
import type { WorkflowDefinition, WorkflowResult } from "../workflows/types";
import { BrowserManager } from "./browser-manager";
import { WorkflowRecorder, type WorkflowArtifactsSummary } from "./workflow-recorder";

export type WorkflowExecution = WorkflowResult & {
  workflow: string;
  artifacts: WorkflowArtifactsSummary;
};

export async function executeWorkflow<TParams>(options: {
  workflow: WorkflowDefinition<TParams>;
  params: TParams;
  browserManager: BrowserManager;
  config: BrowserlaneConfig;
}): Promise<WorkflowExecution> {
  const { workflow, params, browserManager, config } = options;
  const recorder = new WorkflowRecorder(workflow.name, config.artifactDir, params);

  let result: WorkflowResult;

  try {
    result = await browserManager.runIsolated(async (browserContext) => {
      await recorder.startTrace(browserContext);

      try {
        return await workflow.run(
          {
            browserContext,
            recorder,
          },
          params
        );
      } finally {
        await recorder.stopTrace(browserContext);
      }
    });
  } catch (error) {
    result = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown workflow execution error",
    };
  }

  return {
    workflow: workflow.name,
    artifacts: recorder.finalize(result),
    ...result,
  };
}
