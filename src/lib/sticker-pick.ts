import { useSyncExternalStore } from "react";

/**
 * The sticker the user picked in the drawer. Any canvas page (note, pdf,
 * idea dump) arms its sticker tool with it so a pick is immediately placeable.
 */

const KEY = "scrap.picked-sticker";
let picked: string | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function pickSticker(id: string | null) {
  picked = id;
  hydrated = true;
  if (typeof window !== "undefined") {
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  }
  emit();
}

function read() {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    picked = window.localStorage.getItem(KEY);
  }
  return picked;
}

export function usePickedSticker(): string | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => null,
  );
}
