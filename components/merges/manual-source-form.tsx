"use client";

import { useState } from "react";
import { createManualSource } from "@/lib/domain/merge-types";
import type { MergeSource } from "@/lib/domain/merge-types";
import { MERGE_PERSPECTIVE_PRESETS } from "@/lib/domain/merge-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ManualSourceFormProps {
  onAdd: (source: MergeSource) => void;
}

export function ManualSourceForm({ onAdd }: ManualSourceFormProps) {
  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");
  const [perspective, setPerspective] = useState("");
  const [sourceTool, setSourceTool] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!content.trim()) return;
    onAdd(
      createManualSource(content, {
        label: label.trim() || undefined,
        perspective: perspective.trim() || undefined,
        sourceTool: sourceTool.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    );
    setContent("");
    setLabel("");
    setPerspective("");
    setSourceTool("");
    setNotes("");
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">Add manual source</CardTitle>
        <CardDescription>
          Paste an AI response, plan, or observation from ChatGPT, Manus, Cursor,
          etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="manual-content">Content</Label>
          <Textarea
            id="manual-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="font-mono"
            placeholder="Paste AI output or your observation…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="manual-label">Label (optional)</Label>
            <Input
              id="manual-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Short name for this source"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-tool">Source tool (optional)</Label>
            <Input
              id="manual-tool"
              value={sourceTool}
              onChange={(e) => setSourceTool(e.target.value)}
              placeholder="ChatGPT, Manus, Cursor…"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-perspective">Perspective (optional)</Label>
          <Input
            id="manual-perspective"
            value={perspective}
            onChange={(e) => setPerspective(e.target.value)}
            placeholder="e.g. risk analysis"
          />
          <div className="flex flex-wrap gap-1">
            {MERGE_PERSPECTIVE_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPerspective(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-notes">Notes (optional)</Label>
          <Textarea
            id="manual-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Context about where this came from…"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={!content.trim()}
          onClick={handleAdd}
        >
          Add manual source
        </Button>
      </CardContent>
    </Card>
  );
}
