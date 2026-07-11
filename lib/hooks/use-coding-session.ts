"use client";

import { useCallback, useEffect, useState } from "react";
import type { CodingSession } from "@/lib/domain/coding-types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useCodingSession(id: string) {
  const { codingSessions } = useRepositories();
  const [data, setData] = useState<CodingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const session = await codingSessions.get(id);
      setData(session);
      if (!session) setError("Coding session not found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load coding session",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, codingSessions]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const session = await codingSessions.get(id);
        if (!cancelled) {
          setData(session);
          if (!session) setError("Coding session not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load coding session",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, codingSessions]);

  const remove = useCallback(async () => {
    await codingSessions.delete(id);
  }, [id, codingSessions]);

  return { data, isLoading, error, refetch, remove };
}
