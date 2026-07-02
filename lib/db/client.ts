import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Iteration, Settings, Workflow } from "@/lib/domain/types";
import {
  DB_NAME,
  DB_VERSION,
  INDEXES,
  STORES,
} from "./schema";

interface ReplicaDB extends DBSchema {
  workflows: {
    key: string;
    value: Workflow;
    indexes: {
      by_updatedAt: string;
    };
  };
  iterations: {
    key: string;
    value: Iteration;
    indexes: {
      by_workflowId: string;
      by_workflowId_sequence: [string, number];
    };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<ReplicaDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ReplicaDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<ReplicaDB>(DB_NAME, DB_VERSION, {
      upgrade: async (db, oldVersion) => {
        if (!db.objectStoreNames.contains(STORES.workflows)) {
          const workflowStore = db.createObjectStore(STORES.workflows, {
            keyPath: "id",
          });
          workflowStore.createIndex(INDEXES.workflowsByUpdatedAt, "updatedAt");
        }

        if (!db.objectStoreNames.contains(STORES.iterations)) {
          const iterationStore = db.createObjectStore(STORES.iterations, {
            keyPath: "id",
          });
          iterationStore.createIndex(
            INDEXES.iterationsByWorkflowId,
            "workflowId",
          );
          iterationStore.createIndex(
            INDEXES.iterationsByWorkflowIdSequence,
            ["workflowId", "sequenceNumber"],
          );
        }

        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: "id" });
        }

        if (oldVersion < 2 && db.objectStoreNames.contains(STORES.iterations)) {
          const tx = db.transaction(STORES.iterations, "readwrite");
          const store = tx.objectStore(STORES.iterations);
          let cursor = await store.openCursor();
          while (cursor) {
            const iteration = cursor.value as Iteration;
            if (!iteration.followedPriorRecommendation) {
              iteration.followedPriorRecommendation = "not_applicable";
              await cursor.update(iteration);
            }
            cursor = await cursor.continue();
          }
        }
      },
    });
  }

  return dbPromise;
}
