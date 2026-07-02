"use client";

import { useCallback, useEffect, useState } from "react";
import type { Workflow } from "@/lib/domain/types";
import { useRepositories } from "@/components/providers/repository-provider";

export function useWorkflow(id: string) {
  const { workflows } = useRepositories();
  const [data, setData] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await workflows.get(id);
      setData(workflow);
      if (!workflow) setError("Workflow not found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  }, [id, workflows]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const workflow = await workflows.get(id);
        if (!cancelled) {
          setData(workflow);
          if (!workflow) setError("Workflow not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load workflow",
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
  }, [id, workflows]);

  const remove = useCallback(async () => {
    await workflows.delete(id);
  }, [id, workflows]);

  return { data, isLoading, error, refetch, remove };
}
