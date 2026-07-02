"use client";

import { useState } from "react";
import Link from "next/link";
import { OPENAI_MODELS } from "@/lib/domain/types";
import { useSettings } from "@/lib/hooks/use-settings";

export default function SettingsPage() {
  const { settings, isLoading, save, hasApiKey } = useSettings();
  const [apiKey, setApiKey] = useState("");
  const [modelDraft, setModelDraft] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const model = modelDraft ?? settings?.openaiModel ?? "gpt-4o-mini";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    try {
      await save({
        openaiApiKey: apiKey || settings?.openaiApiKey || "",
        openaiModel: model,
      });
      setApiKey("");
      setModelDraft(null);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your API key is stored locally in this browser and sent only to
          OpenAI for analysis.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading settings…</p>
      ) : (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              OpenAI API key
            </label>
            {hasApiKey ? (
              <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                Key saved. Enter a new value below to replace it.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                Required to analyze runs.
              </p>
            )}
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? "••••••••••••••••" : "sk-..."}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModelDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {OPENAI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Data is stored in your browser&apos;s IndexedDB. Clearing site
              data will delete workflows and iterations. No cloud sync in this
              version.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || (!apiKey && !hasApiKey)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSaving ? "Saving…" : "Save settings"}
            </button>
            {saved ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Saved
              </span>
            ) : null}
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            >
              Back to workflows
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
