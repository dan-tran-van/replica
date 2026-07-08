import type {
  CreateMergeSessionInput,
  MergeResult,
  MergeSession,
} from "@/lib/domain/merge-types";
import { getDB } from "@/lib/db/client";
import { INDEXES, STORES } from "@/lib/db/schema";
import type { MergeSessionRepository } from "../types";

export class IndexedDBMergeSessionRepository implements MergeSessionRepository {
  async list(): Promise<MergeSession[]> {
    const db = await getDB();
    const sessions = await db.getAllFromIndex(
      STORES.mergeSessions,
      INDEXES.mergeSessionsByUpdatedAt,
    );
    return sessions.reverse();
  }

  async get(id: string): Promise<MergeSession | null> {
    const db = await getDB();
    return (await db.get(STORES.mergeSessions, id)) ?? null;
  }

  async create(input: CreateMergeSessionInput): Promise<MergeSession> {
    const now = new Date().toISOString();
    const session: MergeSession = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      userGoal: input.userGoal?.trim() || undefined,
      sources: input.sources,
      result: null,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDB();
    await db.put(STORES.mergeSessions, session);
    return session;
  }

  async updateResult(
    id: string,
    result: MergeResult | null,
  ): Promise<MergeSession> {
    const db = await getDB();
    const session = await db.get(STORES.mergeSessions, id);
    if (!session) {
      throw new Error("Merge session not found");
    }

    session.result = result;
    session.updatedAt = new Date().toISOString();
    await db.put(STORES.mergeSessions, session);
    return session;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.mergeSessions, id);
  }
}
