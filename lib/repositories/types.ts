import type {
  CreateMergeSessionInput,
  MergeResult,
  MergeSession,
} from "@/lib/domain/merge-types";
import type {
  CreateIterationInput,
  CreateWorkflowInput,
  Iteration,
  IterationAnalysis,
  Settings,
  Workflow,
} from "@/lib/domain/types";

export interface WorkflowRepository {
  list(): Promise<Workflow[]>;
  get(id: string): Promise<Workflow | null>;
  create(input: CreateWorkflowInput): Promise<Workflow>;
  delete(id: string): Promise<void>;
  touch(id: string): Promise<void>;
}

export interface IterationRepository {
  listByWorkflow(workflowId: string): Promise<Iteration[]>;
  listAll(): Promise<Iteration[]>;
  get(id: string): Promise<Iteration | null>;
  create(input: CreateIterationInput, sequenceNumber: number): Promise<Iteration>;
  updateAnalysis(
    id: string,
    analysis: IterationAnalysis | null,
  ): Promise<Iteration>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<Settings>;
}

export interface MergeSessionRepository {
  list(): Promise<MergeSession[]>;
  get(id: string): Promise<MergeSession | null>;
  create(input: CreateMergeSessionInput): Promise<MergeSession>;
  updateResult(id: string, result: MergeResult | null): Promise<MergeSession>;
  delete(id: string): Promise<void>;
}

export interface Repositories {
  workflows: WorkflowRepository;
  iterations: IterationRepository;
  settings: SettingsRepository;
  mergeSessions: MergeSessionRepository;
}
