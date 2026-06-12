// Tiny IndexedDB-backed store for recent challenge progress cards.
// Stores up to MAX entries per challenge slug. Browser-only.

export type ProgressSnapshot = {
  id: string;
  slug: string;
  pct: number;
  completed: number;
  stepCount: number;
  capturedAt: number; // epoch ms
  source: "download" | "share";
  blob: Blob;
};

const DB_NAME = "gryt-progress-gallery";
const STORE = "snapshots";
const VERSION = 1;
const MAX_PER_SLUG = 5;

function isBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("slug_capturedAt", ["slug", "capturedAt"]);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSnapshot(
  s: Omit<ProgressSnapshot, "id" | "capturedAt"> & {
    id?: string;
    capturedAt?: number;
  },
): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  const record: ProgressSnapshot = {
    id: s.id ?? crypto.randomUUID(),
    capturedAt: s.capturedAt ?? Date.now(),
    slug: s.slug,
    pct: s.pct,
    completed: s.completed,
    stepCount: s.stepCount,
    source: s.source,
    blob: s.blob,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await pruneSlug(s.slug);
}

export async function listSnapshots(slug: string): Promise<ProgressSnapshot[]> {
  if (!isBrowser()) return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out: ProgressSnapshot[] = [];
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const v = cursor.value as ProgressSnapshot;
        if (v.slug === slug) out.push(v);
        cursor.continue();
      } else {
        out.sort((a, b) => b.capturedAt - a.capturedAt);
        resolve(out.slice(0, MAX_PER_SLUG));
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSnapshot(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function pruneSlug(slug: string): Promise<void> {
  const all = await listAllForSlug(slug);
  if (all.length <= MAX_PER_SLUG) return;
  const extra = all.slice(MAX_PER_SLUG);
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    extra.forEach((e) => store.delete(e.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function listAllForSlug(slug: string): Promise<ProgressSnapshot[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out: ProgressSnapshot[] = [];
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const v = cursor.value as ProgressSnapshot;
        if (v.slug === slug) out.push(v);
        cursor.continue();
      } else {
        out.sort((a, b) => b.capturedAt - a.capturedAt);
        resolve(out);
      }
    };
    req.onerror = () => reject(req.error);
  });
}
