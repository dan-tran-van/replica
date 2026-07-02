"use client";

import { useCallback, useEffect, useState } from "react";
import type { Workflow } from "@/lib/domain/types";
import { useRepositories } from "@/components/providers/repository-provider";

export interface WorkflowWithCount extends Workflow {
  iterationCount: number;
}

export function useWorkflows() {
  const { workflows, iterations } = useRepositories();
  const [data, setData] = useState<WorkflowWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await workflows.list();
      const withCounts = await Promise.all(
        list.map(async (workflow) => {
          const workflowIterations = await iterations.listByWorkflow(workflow.id);
          return { ...workflow, iterationCount: workflowIterations.length };
        }),
      );
      setData(withCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  }, [workflows, iterations]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await workflows.list();
        const withCounts = await Promise.all(
          list.map(async (workflow) => {
            const workflowIterations = await iterations.listByWorkflow(
              workflow.id,
            );
            return { ...workflow, iterationCount: workflowIterations.length };
          }),
        );
        if (!cancelled) setData(withCounts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load workflows",
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
  }, [workflows, iterations]);

  return { data, isLoading, error, refetch };
}
