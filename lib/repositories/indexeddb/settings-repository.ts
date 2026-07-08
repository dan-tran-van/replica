import { DEFAULT_SETTINGS, type Settings } from "@/lib/domain/types";
import { getDB } from "@/lib/db/client";
import { STORES } from "@/lib/db/schema";
import { normalizeSettingsRecord } from "@/lib/domain/persistence-compat";
import type { SettingsRepository } from "../types";

export class IndexedDBSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const db = await getDB();
    const settings = await db.get(STORES.settings, DEFAULT_SETTINGS.id);
    return normalizeSettingsRecord(settings);
  }

  async save(settings: Settings): Promise<Settings> {
    const db = await getDB();
    const normalized = normalizeSettingsRecord(settings);
    await db.put(STORES.settings, normalized);
    return normalized;
  }
}
