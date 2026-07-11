import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CodingSession } from "@/lib/domain/coding-types";
import type { MergeSession } from "@/lib/domain/merge-types";
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
  mergeSessions: {
    key: string;
    value: MergeSession;
    indexes: {
      by_updatedAt: string;
    };
  };
  codingSessions: {
    key: string;
    value: CodingSession;
    indexes: {
      by_updatedAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ReplicaDB>> | null = null;
let currentDb: IDBPDatabase<ReplicaDB> | null = null;

function createMissingStores(db: IDBPDatabase<ReplicaDB>) {
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
    iterationStore.createIndex(INDEXES.iterationsByWorkflowId, "workflowId");
    iterationStore.createIndex(INDEXES.iterationsByWorkflowIdSequence, [
      "workflowId",
      "sequenceNumber",
    ]);
  }

  if (!db.objectStoreNames.contains(STORES.settings)) {
    db.createObjectStore(STORES.settings, { keyPath: "id" });
  }

  if (!db.objectStoreNames.contains(STORES.mergeSessions)) {
    const mergeStore = db.createObjectStore(STORES.mergeSessions, {
      keyPath: "id",
    });
    mergeStore.createIndex(INDEXES.mergeSessionsByUpdatedAt, "updatedAt");
  }

  if (!db.objectStoreNames.contains(STORES.codingSessions)) {
    const codingStore = db.createObjectStore(STORES.codingSessions, {
      keyPath: "id",
    });
    codingStore.createIndex(INDEXES.codingSessionsByUpdatedAt, "updatedAt");
  }
}

export function getDB(): Promise<IDBPDatabase<ReplicaDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<ReplicaDB>(DB_NAME, DB_VERSION, {
      upgrade: async (db, oldVersion, _newVersion, transaction) => {
        createMissingStores(db);

        if (oldVersion < 2 && db.objectStoreNames.contains(STORES.iterations)) {
          const store = transaction.objectStore(STORES.iterations);
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
      blocking: () => {
        currentDb?.close();
        currentDb = null;
        dbPromise = null;
      },
      terminated: () => {
        currentDb = null;
        dbPromise = null;
      },
    })
      .then((db) => {
        currentDb = db;
        db.addEventListener("versionchange", () => {
          db.close();
          if (currentDb === db) {
            currentDb = null;
          }
          dbPromise = null;
        });
        return db;
      })
      .catch((err: unknown) => {
        currentDb = null;
        dbPromise = null;
        throw err;
      });
  }

  return dbPromise;
}
