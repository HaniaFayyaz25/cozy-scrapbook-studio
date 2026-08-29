import { useSyncExternalStore } from "react";

export type Point = { x: number; y: number };

export type StrokeItem = {
  id: string;
  kind: "stroke";
  tool: "pen" | "pencil" | "highlighter" | "underline" | "arrow" | "circle";
  color: string;
  width: number;
  points: Point[];
};

export type StickerItem = {
  id: string;
  kind: "sticker";
  stickerId: string;
  x: number;
  y: number;
  rot: number;
  scale: number;
};

export type TextItem = {
  id: string;
  kind: "text";
  x: number;
  y: number;
  rot: number;
  text: string;
  color: string;
  hand: boolean;
  size: number;
};

export type CanvasItem = StrokeItem | StickerItem | TextItem;

export type NotePage = { id: string; text: string; items: CanvasItem[] };

export type Note = {
  id: string;
  title: string;
  pages: NotePage[];
  createdAt: number;
  updatedAt: number;
  tape: string;
};

export type PdfDoc = {
  id: string;
  name: string;
  addedAt: number;
  pageCount: number;
  annotations: Record<string, CanvasItem[]>;
};

export type IdeaBoard = { items: CanvasItem[] };

export type Settings = {
  ambient: number; // 0 = off, 1 = calm, 2 = lively
  grain: boolean;
  reduceMotion: boolean;
  scrapyOn: boolean;
  paperTone: "cream" | "warm" | "cool";
};

export type ScrapState = {
  notes: Note[];
  pdfs: PdfDoc[];
  ideas: IdeaBoard;
  settings: Settings;
};

const KEY = "scrap.state.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

const starterNote = (): Note => ({
  id: "starter-note",
  title: "first notes",
  tape: "var(--petal)",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pages: [
    {
      id: "starter-page",
      text: "things to remember\n\nthe margins are where the real reading happens.\ncome back to page 42 — something about the light.\n",
      items: [
        { id: "starter-sticker-1", kind: "sticker", stickerId: "m-flower-pink", x: 420, y: 90, rot: -8, scale: 1 },
        { id: "starter-sticker-2", kind: "sticker", stickerId: "sc-tape", x: 60, y: 40, rot: 6, scale: 1 },
      ],
    },
  ],
});

const defaultState: ScrapState = {
  notes: [starterNote()],
  pdfs: [],
  ideas: {
    items: [
      { id: "starter-idea-1", kind: "text", x: 120, y: 120, rot: -2, text: "summer project ideas", color: "var(--espresso)", hand: true, size: 34 },
      { id: "starter-idea-2", kind: "text", x: 150, y: 190, rot: 1, text: "zine · sticker pack · mini book", color: "var(--ink-soft)", hand: true, size: 26 },
      { id: "starter-idea-3", kind: "sticker", stickerId: "s-tape-sage", x: 96, y: 96, rot: -7, scale: 1 },
      { id: "starter-idea-4", kind: "sticker", stickerId: "b-daisy", x: 430, y: 210, rot: 5, scale: 1 },
    ],
  },
  settings: { ambient: 1, grain: true, reduceMotion: false, scrapyOn: true, paperTone: "cream" },
};

let state: ScrapState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function load(): ScrapState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as ScrapState;
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings ?? {}) },
      ideas: parsed.ideas ?? defaultState.ideas,
    };
  } catch {
    return defaultState;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
  emit();
}

export function setState(updater: (s: ScrapState) => ScrapState) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useScrap<T>(selector: (s: ScrapState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultState),
  );
}

export const getState = () => state;

/* ------------------------------- actions -------------------------------- */

export const actions = {
  createNote(title = "untitled page") {
    const tapes = ["var(--petal)", "var(--sage)", "var(--sky)", "var(--amber)", "var(--rose)"];
    const tape = tapes[state.notes.length % tapes.length]!;
    const n: Note = {
      id: uid(),
      title,
      tape,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [{ id: uid(), text: "", items: [] }],
    };
    setState((s) => ({ ...s, notes: [n, ...s.notes] }));
    return n.id;
  },
  updateNote(id: string, patch: Partial<Note>) {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    }));
  },
  deleteNote(id: string) {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  },
  addPage(noteId: string) {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) =>
        n.id === noteId
          ? { ...n, updatedAt: Date.now(), pages: [...n.pages, { id: uid(), text: "", items: [] }] }
          : n,
      ),
    }));
  },
  setPage(noteId: string, pageId: string, patch: Partial<NotePage>) {
    setState((s) => ({
      ...s,
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              updatedAt: Date.now(),
              pages: n.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
            }
          : n,
      ),
    }));
  },
  setIdeas(items: CanvasItem[]) {
    setState((s) => ({ ...s, ideas: { items } }));
  },
  addPdf(doc: PdfDoc) {
    setState((s) => ({ ...s, pdfs: [doc, ...s.pdfs] }));
  },
  deletePdf(id: string) {
    setState((s) => ({ ...s, pdfs: s.pdfs.filter((p) => p.id !== id) }));
  },
  setPdfAnnotations(id: string, page: number, items: CanvasItem[]) {
    setState((s) => ({
      ...s,
      pdfs: s.pdfs.map((p) =>
        p.id === id ? { ...p, annotations: { ...p.annotations, [String(page)]: items } } : p,
      ),
    }));
  },
  setSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  importState(next: ScrapState) {
    setState(() => next);
  },
};

/* --------------------------- PDF blob storage ---------------------------- */

const DB = "scrap-files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(id: string, data: ArrayBuffer) {
  const db = await openDb();
  await new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(data, id);
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
}

export async function loadFile(id: string): Promise<ArrayBuffer | undefined> {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction("files", "readonly");
    const r = tx.objectStore("files").get(id);
    r.onsuccess = () => res(r.result as ArrayBuffer | undefined);
    r.onerror = () => rej(r.error);
  });
}
