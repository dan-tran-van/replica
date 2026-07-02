"use client";

import { useCallback, useEffect, useState } from "react";
import { SETTINGS_ID, type Settings } from "@/lib/domain/types";
import { useRepositories } from "@/components/providers/repository-provider";

interface UseSettingsResult {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  save: (partial: Partial<Pick<Settings, "openaiApiKey" | "openaiModel">>) => Promise<void>;
  refetch: () => Promise<void>;
  hasApiKey: boolean;
}

export function useSettings(): UseSettingsResult {
  const { settings: settingsRepo } = useRepositories();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsRepo.get();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [settingsRepo]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await settingsRepo.get();
        if (!cancelled) setSettings(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load settings",
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
  }, [settingsRepo]);

  const save = useCallback(
    async (partial: Partial<Pick<Settings, "openaiApiKey" | "openaiModel">>) => {
      const current = settings ?? (await settingsRepo.get());
      const updated: Settings = {
        id: SETTINGS_ID,
        openaiApiKey: partial.openaiApiKey ?? current.openaiApiKey,
        openaiModel: partial.openaiModel ?? current.openaiModel,
      };
      const saved = await settingsRepo.save(updated);
      setSettings(saved);
    },
    [settings, settingsRepo],
  );

  return {
    settings,
    isLoading,
    error,
    save,
    refetch,
    hasApiKey: Boolean(settings?.openaiApiKey?.trim()),
  };
}
