export const DB_NAME = "replica";
export const DB_VERSION = 2;

export const STORES = {
  workflows: "workflows",
  iterations: "iterations",
  settings: "settings",
} as const;

export const INDEXES = {
  workflowsByUpdatedAt: "by_updatedAt",
  iterationsByWorkflowId: "by_workflowId",
  iterationsByWorkflowIdSequence: "by_workflowId_sequence",
} as const;
