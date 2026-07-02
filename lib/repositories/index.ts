import { IndexedDBIterationRepository } from "./indexeddb/iteration-repository";
import { IndexedDBSettingsRepository } from "./indexeddb/settings-repository";
import { IndexedDBWorkflowRepository } from "./indexeddb/workflow-repository";
import type { Repositories } from "./types";

export const repositories: Repositories = {
  workflows: new IndexedDBWorkflowRepository(),
  iterations: new IndexedDBIterationRepository(),
  settings: new IndexedDBSettingsRepository(),
};

export type {
  IterationRepository,
  Repositories,
  SettingsRepository,
  WorkflowRepository,
} from "./types";
