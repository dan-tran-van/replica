"use client";

import { useCallback, useEffect, useState } from "react";
import type { CodingSession } from "@/lib/domain/coding-types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useCodingSessions() {
  const { codingSessions } = useRepositories();
  const [data, setData] = useState<CodingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await codingSessions.list();
      setData(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load coding sessions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [codingSessions]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await codingSessions.list();
        if (!cancelled) setData(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load coding sessions",
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
  }, [codingSessions]);

  return { data, isLoading, error, refetch };
}
