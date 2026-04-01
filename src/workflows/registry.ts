import { demoIntakeWorkflow } from "./demo-intake";
import { demoDashboardWorkflow } from "./demo-dashboard";
import type { WorkflowDefinition } from "./types";

const workflowEntries: WorkflowDefinition[] = [demoDashboardWorkflow, demoIntakeWorkflow];

export const workflowRegistry = new Map<string, WorkflowDefinition>(
  workflowEntries.map((workflow) => [workflow.name, workflow])
);

export function listWorkflows(): Array<{ name: string; description: string; replayFixture?: string }> {
  return workflowEntries.map((workflow) => ({
    name: workflow.name,
    description: workflow.description,
    ...(workflow.replayFixture ? { replayFixture: workflow.replayFixture } : {}),
  }));
}
