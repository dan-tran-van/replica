export const DB_NAME = "replica";
export const DB_VERSION = 5;

export const STORES = {
  workflows: "workflows",
  iterations: "iterations",
  settings: "settings",
  mergeSessions: "mergeSessions",
  codingSessions: "codingSessions",
} as const;

export const INDEXES = {
  workflowsByUpdatedAt: "by_updatedAt",
  iterationsByWorkflowId: "by_workflowId",
  iterationsByWorkflowIdSequence: "by_workflowId_sequence",
  mergeSessionsByUpdatedAt: "by_updatedAt",
  codingSessionsByUpdatedAt: "by_updatedAt",
} as const;
