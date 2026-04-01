import type { BrowserContext } from "playwright";
import type { WorkflowRecorder } from "../runtime/workflow-recorder";

export type WorkflowSuccess = {
  success: true;
  data: Record<string, unknown>;
};

export type WorkflowFailure = {
  success: false;
  error: string;
  data?: Record<string, unknown>;
};

export type WorkflowResult = WorkflowSuccess | WorkflowFailure;

export interface WorkflowRuntime {
  browserContext: BrowserContext;
  recorder: WorkflowRecorder;
}

export interface WorkflowDefinition<TParams = unknown> {
  name: string;
  description: string;
  replayFixture?: string;
  parseParams(params: unknown): TParams;
  run(runtime: WorkflowRuntime, params: TParams): Promise<WorkflowResult>;
}
