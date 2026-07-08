import type {
  CreateIterationInput,
  Iteration,
  IterationAnalysis,
} from "@/lib/domain/types";
import { getDB } from "@/lib/db/client";
import { INDEXES, STORES } from "@/lib/db/schema";
import { normalizeIterationRecord } from "@/lib/domain/persistence-compat";
import type { IterationRepository } from "../types";

export class IndexedDBIterationRepository implements IterationRepository {
  async listByWorkflow(workflowId: string): Promise<Iteration[]> {
    const db = await getDB();
    const iterations = await db.getAllFromIndex(
      STORES.iterations,
      INDEXES.iterationsByWorkflowId,
      workflowId,
    );
    return iterations
      .map((iteration) => normalizeIterationRecord(iteration))
      .filter((iteration): iteration is Iteration => iteration !== null)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  async listAll(): Promise<Iteration[]> {
    const db = await getDB();
    const iterations = await db.getAll(STORES.iterations);
    return iterations
      .map((iteration) => normalizeIterationRecord(iteration))
      .filter((iteration): iteration is Iteration => iteration !== null);
  }

  async get(id: string): Promise<Iteration | null> {
    const db = await getDB();
    return normalizeIterationRecord(await db.get(STORES.iterations, id));
  }

  async create(
    input: CreateIterationInput,
    sequenceNumber: number,
  ): Promise<Iteration> {
    const iteration: Iteration = {
      id: crypto.randomUUID(),
      workflowId: input.workflowId,
      sequenceNumber,
      promptUsed: input.promptUsed,
      manusOutput: input.manusOutput,
      outcome: input.outcome,
      observations: input.observations,
      followedPriorRecommendation: input.followedPriorRecommendation,
      analysis: null,
      createdAt: new Date().toISOString(),
    };

    const db = await getDB();
    await db.put(STORES.iterations, iteration);
    return normalizeIterationRecord(iteration) ?? iteration;
  }

  async updateAnalysis(
    id: string,
    analysis: IterationAnalysis | null,
  ): Promise<Iteration> {
    const db = await getDB();
    const iteration = await db.get(STORES.iterations, id);
    if (!iteration) {
      throw new Error(`Iteration ${id} not found`);
    }

    const normalized = normalizeIterationRecord(iteration);
    if (!normalized) {
      throw new Error(`Iteration ${id} is malformed`);
    }

    normalized.analysis = analysis;
    await db.put(STORES.iterations, normalized);
    return normalized;
  }
}
