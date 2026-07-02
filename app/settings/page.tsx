"use client";

import { useState } from "react";
import Link from "next/link";
import { OPENAI_MODELS } from "@/lib/domain/types";
import { useSettings } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your API key is stored locally in this browser and sent only to
          OpenAI for analysis.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>OpenAI configuration</CardTitle>
            <CardDescription>
              Required for analyzing runs and proposing prompt improvements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API key</Label>
                {hasApiKey ? (
                  <p className="text-xs text-primary">
                    Key saved. Enter a new value below to replace it.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Required to analyze runs.
                  </p>
                )}
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasApiKey ? "••••••••••••••••" : "sk-..."}
                  autoComplete="off"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={model}
                  onValueChange={(value) => setModelDraft(value)}
                >
                  <SelectTrigger id="model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENAI_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertDescription>
                  Data is stored in your browser&apos;s IndexedDB. Clearing site
                  data will delete workflows and iterations. No cloud sync in
                  this version.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSaving || (!apiKey && !hasApiKey)}
                >
                  {isSaving ? "Saving…" : "Save settings"}
                </Button>
                {saved ? (
                  <span className="text-sm text-primary">Saved</span>
                ) : null}
                <Button variant="ghost" asChild>
                  <Link href="/">Back to workflows</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
