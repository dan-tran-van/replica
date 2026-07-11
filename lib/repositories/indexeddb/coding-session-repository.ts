import type {
  CodingAttempt,
  CodingReflection,
  CodingSession,
  CreateCodingAttemptInput,
  CreateCodingSessionInput,
  UpdateCodingAttemptInput,
  UpdateCodingAttemptOutcomeInput,
  UpdateCodingSessionContextInput,
} from "@/lib/domain/coding-types";
import { getDB } from "@/lib/db/client";
import { INDEXES, STORES } from "@/lib/db/schema";
import {
  normalizeCodingReflectionRecord,
  normalizeCodingSessionContextRecord,
  normalizeCodingSessionRecord,
} from "@/lib/domain/persistence-compat";
import type { CodingSessionRepository } from "../types";

export class IndexedDBCodingSessionRepository
  implements CodingSessionRepository
{
  async list(): Promise<CodingSession[]> {
    const db = await getDB();
    const sessions = await db.getAllFromIndex(
      STORES.codingSessions,
      INDEXES.codingSessionsByUpdatedAt,
    );
    return sessions
      .map((session) => normalizeCodingSessionRecord(session))
      .filter((session): session is CodingSession => session !== null)
      .reverse();
  }

  async get(id: string): Promise<CodingSession | null> {
    const db = await getDB();
    return normalizeCodingSessionRecord(await db.get(STORES.codingSessions, id));
  }

  async create(input: CreateCodingSessionInput): Promise<CodingSession> {
    const now = new Date().toISOString();
    const session: CodingSession = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      taskDescription: input.taskDescription.trim(),
      createdAt: now,
      updatedAt: now,
      status: "active",
      sessionContext: null,
      attempts: [],
    };

    const db = await getDB();
    await db.put(STORES.codingSessions, session);
    return normalizeCodingSessionRecord(session) ?? session;
  }

  async addAttempt(
    sessionId: string,
    input: CreateCodingAttemptInput,
  ): Promise<CodingAttempt> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const now = new Date().toISOString();
    const attempt: CodingAttempt = {
      id: crypto.randomUUID(),
      toolUsed: input.toolUsed.trim(),
      originalPrompt: input.originalPrompt.trim(),
      aiOutput: input.aiOutput.trim(),
      errorOutput: input.errorOutput.trim(),
      developerNotes: input.developerNotes.trim(),
      resultSummary: input.resultSummary.trim(),
      status: input.status,
      generatedReflection: null,
      createdAt: now,
      outcome: "notRun",
      outcomeNotes: "",
      basedOnAttemptId: input.basedOnAttemptId,
      recommendedMode: input.recommendedMode,
      source: input.source ?? "manual",
    };

    const updated: CodingSession = {
      ...session,
      status: "active",
      updatedAt: now,
      attempts: [...session.attempts, attempt],
    };

    await db.put(STORES.codingSessions, updated);
    return attempt;
  }

  async updateAttemptReflection(
    sessionId: string,
    attemptId: string,
    reflection: CodingReflection | null,
  ): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const normalizedReflection = reflection
      ? normalizeCodingReflectionRecord(reflection) ?? reflection
      : null;

    const updated = this.updateAttemptRecord(session, attemptId, (attempt) => ({
      ...attempt,
      generatedReflection: normalizedReflection,
    }));

    await db.put(STORES.codingSessions, updated);
    return updated;
  }

  async updateAttemptOutcome(
    sessionId: string,
    attemptId: string,
    input: UpdateCodingAttemptOutcomeInput,
  ): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const updated = this.updateAttemptRecord(session, attemptId, (attempt) => ({
      ...attempt,
      outcome: input.outcome,
      outcomeNotes: input.outcomeNotes.trim(),
    }));

    const hasFixedAttempt = updated.attempts.some(
      (attempt) => attempt.outcome === "fixed",
    );
    const sessionWithStatus: CodingSession = {
      ...updated,
      status: hasFixedAttempt ? "resolved" : "active",
    };

    await db.put(STORES.codingSessions, sessionWithStatus);
    return sessionWithStatus;
  }

  async updateContext(
    sessionId: string,
    input: UpdateCodingSessionContextInput,
  ): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const now = new Date().toISOString();
    const createdAt = session.sessionContext?.createdAt ?? now;
    const context = normalizeCodingSessionContextRecord({
      summary: input.summary.trim(),
      goals: input.goals.map((item) => item.trim()).filter(Boolean),
      constraints: input.constraints.map((item) => item.trim()).filter(Boolean),
      relevantFiles: input.relevantFiles
        .map((item) => item.trim())
        .filter(Boolean),
      assumptions: input.assumptions.map((item) => item.trim()).filter(Boolean),
      notes: input.notes.trim(),
      source: input.source ?? session.sessionContext?.source ?? "manual",
      model: input.model ?? session.sessionContext?.model,
      createdAt,
      updatedAt: now,
    });

    if (!context) {
      throw new Error("Add session context before saving.");
    }

    const updated: CodingSession = {
      ...session,
      sessionContext: context,
      updatedAt: now,
    };

    await db.put(STORES.codingSessions, updated);
    return updated;
  }

  async clearContext(sessionId: string): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const updated: CodingSession = {
      ...session,
      sessionContext: null,
      updatedAt: new Date().toISOString(),
    };

    await db.put(STORES.codingSessions, updated);
    return updated;
  }

  async updateAttempt(
    sessionId: string,
    attemptId: string,
    input: UpdateCodingAttemptInput,
  ): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const updated = this.updateAttemptRecord(session, attemptId, (attempt) => ({
      ...attempt,
      toolUsed: input.toolUsed.trim(),
      originalPrompt: input.originalPrompt.trim(),
      aiOutput: input.aiOutput.trim(),
      errorOutput: input.errorOutput.trim(),
      developerNotes: input.developerNotes.trim(),
      resultSummary: input.resultSummary.trim(),
      status: input.status,
      recommendedMode: input.recommendedMode,
      source: input.source ?? attempt.source,
    }));

    await db.put(STORES.codingSessions, updated);
    return updated;
  }

  async deleteAttempt(
    sessionId: string,
    attemptId: string,
  ): Promise<CodingSession> {
    const db = await getDB();
    const session = await this.getRequiredSession(sessionId);
    const attempts = session.attempts.filter(
      (attempt) => attempt.id !== attemptId,
    );

    if (attempts.length === session.attempts.length) {
      throw new Error("Coding attempt not found");
    }

    const hasFixedAttempt = attempts.some(
      (attempt) => attempt.outcome === "fixed",
    );
    const updated: CodingSession = {
      ...session,
      attempts,
      status: hasFixedAttempt ? "resolved" : "active",
      updatedAt: new Date().toISOString(),
    };

    await db.put(STORES.codingSessions, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.codingSessions, id);
  }

  private async getRequiredSession(id: string): Promise<CodingSession> {
    const db = await getDB();
    const session = normalizeCodingSessionRecord(
      await db.get(STORES.codingSessions, id),
    );
    if (!session) {
      throw new Error("Coding session not found");
    }
    return session;
  }

  private updateAttemptRecord(
    session: CodingSession,
    attemptId: string,
    update: (attempt: CodingAttempt) => CodingAttempt,
  ): CodingSession {
    let found = false;
    const attempts = session.attempts.map((attempt) => {
      if (attempt.id !== attemptId) return attempt;
      found = true;
      return update(attempt);
    });

    if (!found) {
      throw new Error("Coding attempt not found");
    }

    return {
      ...session,
      updatedAt: new Date().toISOString(),
      attempts,
    };
  }
}
