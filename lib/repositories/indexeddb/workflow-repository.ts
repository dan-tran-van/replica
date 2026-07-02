import type { CreateWorkflowInput, Workflow } from "@/lib/domain/types";
import { getDB } from "@/lib/db/client";
import { INDEXES, STORES } from "@/lib/db/schema";
import type { WorkflowRepository } from "../types";

export class IndexedDBWorkflowRepository implements WorkflowRepository {
  async list(): Promise<Workflow[]> {
    const db = await getDB();
    const workflows = await db.getAllFromIndex(
      STORES.workflows,
      INDEXES.workflowsByUpdatedAt,
    );
    return workflows.reverse();
  }

  async get(id: string): Promise<Workflow | null> {
    const db = await getDB();
    return (await db.get(STORES.workflows, id)) ?? null;
  }

  async create(input: CreateWorkflowInput): Promise<Workflow> {
    const now = new Date().toISOString();
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      starterPrompt: input.starterPrompt,
      workflowType: "manus-scheduled",
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDB();
    await db.put(STORES.workflows, workflow);
    return workflow;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([STORES.workflows, STORES.iterations], "readwrite");

    const iterations = await tx
      .objectStore(STORES.iterations)
      .index(INDEXES.iterationsByWorkflowId)
      .getAll(id);

    for (const iteration of iterations) {
      await tx.objectStore(STORES.iterations).delete(iteration.id);
    }

    await tx.objectStore(STORES.workflows).delete(id);
    await tx.done;
  }

  async touch(id: string): Promise<void> {
    const db = await getDB();
    const workflow = await db.get(STORES.workflows, id);
    if (!workflow) return;

    workflow.updatedAt = new Date().toISOString();
    await db.put(STORES.workflows, workflow);
  }
}
