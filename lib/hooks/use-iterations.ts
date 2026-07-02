"use client";

import { useCallback, useEffect, useState } from "react";
import type { Iteration } from "@/lib/domain/types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useIterations(workflowId: string) {
  const { iterations } = useRepositories();
  const [data, setData] = useState<Iteration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!workflowId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await iterations.listByWorkflow(workflowId);
      setData(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load iterations");
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, iterations]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!workflowId) return;
      setIsLoading(true);
      setError(null);
      try {
        const list = await iterations.listByWorkflow(workflowId);
        if (!cancelled) setData(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load iterations",
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
  }, [workflowId, iterations]);

  return { data, isLoading, error, refetch };
}
