import { IndexedDBCodingSessionRepository } from "./indexeddb/coding-session-repository";
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
  codingSessions: new IndexedDBCodingSessionRepository(),
};

export type {
  CodingSessionRepository,
  IterationRepository,
  MergeSessionRepository,
  Repositories,
  SettingsRepository,
  WorkflowRepository,
} from "./types";
