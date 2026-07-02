import { DEFAULT_SETTINGS, type Settings } from "@/lib/domain/types";
import { getDB } from "@/lib/db/client";
import { STORES } from "@/lib/db/schema";
import type { SettingsRepository } from "../types";

export class IndexedDBSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const db = await getDB();
    const settings = await db.get(STORES.settings, DEFAULT_SETTINGS.id);
    return settings ?? { ...DEFAULT_SETTINGS };
  }

  async save(settings: Settings): Promise<Settings> {
    const db = await getDB();
    await db.put(STORES.settings, settings);
    return settings;
  }
}
