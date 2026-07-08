"use client";

import { useCallback, useEffect, useState } from "react";
import type { MergeSession } from "@/lib/domain/merge-types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useMergeSession(id: string) {
  const { mergeSessions } = useRepositories();
  const [data, setData] = useState<MergeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const session = await mergeSessions.get(id);
      setData(session);
      if (!session) setError("Merge session not found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load merge session",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, mergeSessions]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const session = await mergeSessions.get(id);
        if (!cancelled) {
          setData(session);
          if (!session) setError("Merge session not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load merge session",
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
  }, [id, mergeSessions]);

  const remove = useCallback(async () => {
    await mergeSessions.delete(id);
  }, [id, mergeSessions]);

  return { data, isLoading, error, refetch, remove };
}
