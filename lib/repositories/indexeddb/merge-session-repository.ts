import type {
  CreateMergeSessionInput,
  MergeResult,
  MergeSession,
} from "@/lib/domain/merge-types";
import { getDB } from "@/lib/db/client";
import { INDEXES, STORES } from "@/lib/db/schema";
import {
  normalizeMergeResultRecord,
  normalizeMergeSessionRecord,
} from "@/lib/domain/persistence-compat";
import type { MergeSessionRepository } from "../types";

export class IndexedDBMergeSessionRepository implements MergeSessionRepository {
  async list(): Promise<MergeSession[]> {
    const db = await getDB();
    const sessions = await db.getAllFromIndex(
      STORES.mergeSessions,
      INDEXES.mergeSessionsByUpdatedAt,
    );
    return sessions
      .map((session) => normalizeMergeSessionRecord(session))
      .filter((session): session is MergeSession => session !== null)
      .reverse();
  }

  async get(id: string): Promise<MergeSession | null> {
    const db = await getDB();
    return normalizeMergeSessionRecord(await db.get(STORES.mergeSessions, id));
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
    return normalizeMergeSessionRecord(session) ?? session;
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

    const normalized = normalizeMergeSessionRecord(session);
    if (!normalized) {
      throw new Error("Merge session is malformed");
    }

    normalized.result = result ? normalizeMergeResultRecord(result) ?? result : null;
    normalized.updatedAt = new Date().toISOString();
    await db.put(STORES.mergeSessions, normalized);
    return normalized;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.mergeSessions, id);
  }
}
