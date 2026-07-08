import { IndexedDBMergeSessionRepository } from "./indexeddb/merge-session-repository";
import { IndexedDBIterationRepository } from "./indexeddb/iteration-repository";
import { IndexedDBSettingsRepository } from "./indexeddb/settings-repository";
import { IndexedDBWorkflowRepository } from "./indexeddb/workflow-repository";
import type { Repositories } from "./types";

export const repositories: Repositories = {
  workflows: new IndexedDBWorkflowRepository(),
  iterations: new IndexedDBIterationRepository(),
  settings: new IndexedDBSettingsRepository(),
  mergeSessions: new IndexedDBMergeSessionRepository(),
};

export type {
  IterationRepository,
  MergeSessionRepository,
  Repositories,
  SettingsRepository,
  WorkflowRepository,
} from "./types";
