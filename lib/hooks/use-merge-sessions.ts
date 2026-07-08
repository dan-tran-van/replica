"use client";

import { useCallback, useEffect, useState } from "react";
import type { MergeSession } from "@/lib/domain/merge-types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useMergeSessions() {
  const { mergeSessions } = useRepositories();
  const [data, setData] = useState<MergeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await mergeSessions.list();
      setData(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load merge sessions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [mergeSessions]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await mergeSessions.list();
        if (!cancelled) setData(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load merge sessions",
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
  }, [mergeSessions]);

  return { data, isLoading, error, refetch };
}
