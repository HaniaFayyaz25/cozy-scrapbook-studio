import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import { StickerArt } from "@/lib/stickers";
import type { CanvasItem, Point, StrokeItem } from "@/lib/scrap-store";
import { uid } from "@/lib/scrap-store";

export type Tool =
  | "select"
  | "pen"
  | "pencil"
  | "highlighter"
  | "underline"
  | "arrow"
  | "circle"
  | "doodle"
  | "text"
  | "sticker"
  | "eraser";

export type ToolState = {
  tool: Tool;
  color: string;
  highlight: string;
  stickerId: string | null;
};

export const INK_COLORS = [
  { id: "espresso", v: "var(--espresso)" },
  { id: "rose", v: "var(--rose)" },
  { id: "forest", v: "var(--forest)" },
  { id: "sky", v: "var(--sky)" },
  { id: "amber", v: "var(--amber)" },
];

export const HIGHLIGHT_COLORS = [
  { id: "dusty pink", v: "var(--petal)" },
  { id: "lavender", v: "oklch(0.78 0.07 305)" },
  { id: "sage", v: "var(--sage)" },
  { id: "soft sky", v: "var(--sky)" },
  { id: "warm gold", v: "var(--amber)" },
];

/* ----------------------------- geometry ---------------------------------- */

function smoothPath(pts: Point[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const c = pts[i]!;
    const n = pts[i + 1]!;
    const mx = (c.x + n.x) / 2;
    const my = (c.y + n.y) / 2;
    d += ` Q ${c.x} ${c.y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1]!;
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function bbox(pts: Point[]) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    x1: Math.min(...xs),
    x2: Math.max(...xs),
    y1: Math.min(...ys),
    y2: Math.max(...ys),
  };
}

/**
 * The self-straightening highlighter: a rough drag across a line of text is
 * corrected into a clean, level band that still keeps a hand-made wobble.
 */
export function highlightPath(pts: Point[], thickness: number) {
  const b = bbox(pts);
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const h = Math.min(Math.max(b.y2 - b.y1, thickness), thickness * 1.6);
  const x1 = b.x1 - 3;
  const x2 = b.x2 + 3;
  const steps = Math.max(4, Math.round((x2 - x1) / 26));
  const wob = (i: number, seed: number) => Math.sin(i * 1.7 + seed) * 1.5;
  let d = `M ${x1} ${cy - h / 2 + wob(0, 1)}`;
  for (let i = 1; i <= steps; i++) {
    const x = x1 + ((x2 - x1) * i) / steps;
    d += ` L ${x} ${cy - h / 2 + wob(i, 1)}`;
  }
  for (let i = steps; i >= 0; i--) {
    const x = x1 + ((x2 - x1) * i) / steps;
    d += ` L ${x} ${cy + h / 2 + wob(i, 4)}`;
  }
  return d + " Z";
}

function straightLine(pts: Point[]) {
  const b = bbox(pts);
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const steps = Math.max(3, Math.round((b.x2 - b.x1) / 30));
  let d = `M ${b.x1} ${cy}`;
  for (let i = 1; i <= steps; i++) {
    d += ` L ${b.x1 + ((b.x2 - b.x1) * i) / steps} ${cy + Math.sin(i * 2.1) * 1.2}`;
  }
  return d;
}

function arrowPaths(pts: Point[]) {
  const a = pts[0]!;
  const b = pts[pts.length - 1]!;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 14 };
  const shaft = `M ${a.x} ${a.y} Q ${mid.x} ${mid.y} ${b.x} ${b.y}`;
  const head = `M ${b.x - 13 * Math.cos(ang - 0.45)} ${b.y - 13 * Math.sin(ang - 0.45)} L ${b.x} ${b.y} L ${
    b.x - 13 * Math.cos(ang + 0.45)
  } ${b.y - 13 * Math.sin(ang + 0.45)}`;
  return [shaft, head];
}

/* ----------------------------- stroke render ----------------------------- */

function StrokeShape({ st }: { st: StrokeItem }) {
  if (st.points.length < 2) return null;
  switch (st.tool) {
    case "highlighter":
      return (
        <path
          d={highlightPath(st.points, 17)}
          fill={st.color}
          opacity={0.42}
          stroke={st.color}
          strokeOpacity={0.25}
          strokeWidth={2}
          style={{ mixBlendMode: "multiply" }}
        />
      );
    case "underline":
      return (
        <path
          d={straightLine(st.points)}
          fill="none"
          stroke={st.color}
          strokeWidth={st.width}
          strokeLinecap="round"
        />
      );
    case "arrow": {
      const [shaft, head] = arrowPaths(st.points);
      return (
        <g fill="none" stroke={st.color} strokeWidth={st.width} strokeLinecap="round" strokeLinejoin="round">
          <path d={shaft} />
          <path d={head} />
        </g>
      );
    }
    case "circle": {
      const b = bbox(st.points);
      return (
        <ellipse
          cx={(b.x1 + b.x2) / 2}
          cy={(b.y1 + b.y2) / 2}
          rx={Math.max(10, (b.x2 - b.x1) / 2)}
          ry={Math.max(8, (b.y2 - b.y1) / 2)}
          fill="none"
          stroke={st.color}
          strokeWidth={st.width}
          strokeDasharray="0"
          transform={`rotate(-3 ${(b.x1 + b.x2) / 2} ${(b.y1 + b.y2) / 2})`}
        />
      );
    }
    case "pencil":
      return (
        <path
          d={smoothPath(st.points)}
          fill="none"
          stroke={st.color}
          strokeWidth={st.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
          strokeDasharray="2 1.4"
        />
      );
    default:
      return (
        <path
          d={smoothPath(st.points)}
          fill="none"
          stroke={st.color}
          strokeWidth={st.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
}

/* -------------------------------- editor --------------------------------- */

export function useCanvasHistory(items: CanvasItem[], onChange: (i: CanvasItem[]) => void) {
  const past = useRef<CanvasItem[][]>([]);
  const future = useRef<CanvasItem[][]>([]);
  const [, force] = useState(0);

  const commit = useCallback(
    (next: CanvasItem[]) => {
      past.current = [...past.current.slice(-40), items];
      future.current = [];
      onChange(next);
      force((n) => n + 1);
    },
    [items, onChange],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current = [items, ...future.current];
    onChange(prev);
    force((n) => n + 1);
  }, [items, onChange]);

  const redo = useCallback(() => {
    const [next, ...rest] = future.current;
    if (!next) return;
    future.current = rest;
    past.current = [...past.current, items];
    onChange(next);
    force((n) => n + 1);
  }, [items, onChange]);

  return { commit, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}

export function ScrapCanvas({
  items,
  onChange,
  toolState,
  className,
  children,
  history,
  scale = 1,
}: {
  items: CanvasItem[];
  onChange: (i: CanvasItem[]) => void;
  toolState: ToolState;
  className?: string;
  children?: ReactNode;
  scale?: number;
  history: ReturnType<typeof useCanvasHistory>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<StrokeItem | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const { commit } = history;

  const drawing = toolState.tool !== "select" && toolState.tool !== "sticker" && toolState.tool !== "text";

  const toLocal = useCallback(
    (e: { clientX: number; clientY: number }): Point => {
      const r = ref.current!.getBoundingClientRect();
      return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
    },
    [scale],
  );

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const p = toLocal(e);
    if (toolState.tool === "sticker" && toolState.stickerId) {
      commit([
        ...items,
        {
          id: uid(),
          kind: "sticker",
          stickerId: toolState.stickerId,
          x: p.x,
          y: p.y,
          rot: Math.round((Math.random() - 0.5) * 16),
          scale: 1,
        },
      ]);
      return;
    }
    if (toolState.tool === "text") {
      const text = window.prompt("write something");
      if (!text) return;
      commit([
        ...items,
        {
          id: uid(),
          kind: "text",
          x: p.x,
          y: p.y,
          rot: Math.round((Math.random() - 0.5) * 5),
          text,
          color: toolState.color,
          hand: true,
          size: 28,
        },
      ]);
      return;
    }
    if (toolState.tool === "select") {
      setSelected(null);
      return;
    }
    if (toolState.tool === "eraser") return;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDraft({
      id: uid(),
      kind: "stroke",
      tool: toolState.tool === "doodle" ? "pen" : (toolState.tool as StrokeItem["tool"]),
      color: toolState.tool === "highlighter" ? toolState.highlight : toolState.color,
      width: toolState.tool === "pencil" ? 2 : toolState.tool === "underline" ? 2.6 : 2.4,
      points: [p],
    });
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (drag.current) {
      const p = toLocal(e);
      const { id, dx, dy } = drag.current;
      onChange(
        items.map((it) =>
          it.id === id && it.kind !== "stroke" ? { ...it, x: p.x - dx, y: p.y - dy } : it,
        ),
      );
      return;
    }
    if (!draft) return;
    const p = toLocal(e);
    setDraft({ ...draft, points: [...draft.points, p] });
  };

  const endStroke = () => {
    if (drag.current) {
      drag.current = null;
      commit(items);
      return;
    }
    if (!draft) return;
    if (draft.points.length > 1) commit([...items, draft]);
    setDraft(null);
  };

  const remove = (id: string) => {
    commit(items.filter((i) => i.id !== id));
    setSelected(null);
  };

  const mutate = (id: string, patch: Partial<CanvasItem>) =>
    commit(items.map((i) => (i.id === id ? ({ ...i, ...patch } as CanvasItem) : i)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? history.redo() : history.undo();
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selected) {
        e.preventDefault();
        remove(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const cursor = useMemo(() => {
    if (toolState.tool === "select") return "default";
    if (toolState.tool === "eraser") return "cell";
    return "crosshair";
  }, [toolState.tool]);

  const strokes = items.filter((i): i is StrokeItem => i.kind === "stroke");
  const objects = items.filter((i) => i.kind !== "stroke");

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", touchAction: "none", cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerLeave={endStroke}
    >
      {children}

      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none", overflow: "visible" }}>
        {strokes.map((st) => (
          <g
            key={st.id}
            style={{ pointerEvents: toolState.tool === "eraser" ? "stroke" : "none", cursor: "cell" }}
            onPointerDown={(e) => {
              if (toolState.tool !== "eraser") return;
              e.stopPropagation();
              remove(st.id);
            }}
          >
            <StrokeShape st={st} />
          </g>
        ))}
        {draft && <StrokeShape st={draft} />}
      </svg>

      {objects.map((it) => {
        const isSel = selected === it.id;
        return (
          <div
            key={it.id}
            className="absolute sticker-pop"
            style={{
              left: (it as { x: number }).x,
              top: (it as { y: number }).y,
              transform: `translate(-50%,-50%) rotate(${(it as { rot: number }).rot}deg) scale(${
                it.kind === "sticker" ? it.scale : 1
              })`,
              pointerEvents: toolState.tool === "select" || toolState.tool === "eraser" ? "auto" : "none",
              filter: "drop-shadow(0 2px 2px color-mix(in oklab, var(--espresso) 18%, transparent))",
              outline: isSel ? "1.5px dashed color-mix(in oklab, var(--rose) 70%, transparent)" : undefined,
              outlineOffset: 6,
            }}
            onPointerDown={(e) => {
              if (toolState.tool === "eraser") {
                e.stopPropagation();
                remove(it.id);
                return;
              }
              if (toolState.tool !== "select") return;
              e.stopPropagation();
              setSelected(it.id);
              const p = toLocal(e);
              drag.current = {
                id: it.id,
                dx: p.x - (it as { x: number }).x,
                dy: p.y - (it as { y: number }).y,
              };
            }}
          >
            {it.kind === "sticker" ? (
              <StickerArt id={it.stickerId} />
            ) : (
              <span
                className={it.hand ? "hand" : ""}
                style={{ fontSize: it.size, color: it.color, whiteSpace: "pre", lineHeight: 1.15 }}
              >
                {it.text}
              </span>
            )}

            {isSel && (
              <div
                className="paper-card absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1 px-1.5 py-1 text-[11px]"
                style={{ borderRadius: 4 }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {it.kind === "sticker" && (
                  <>
                    <button className="px-1" onClick={() => mutate(it.id, { scale: Math.max(0.4, it.scale - 0.15) })}>
                      −
                    </button>
                    <button className="px-1" onClick={() => mutate(it.id, { scale: Math.min(3, it.scale + 0.15) })}>
                      +
                    </button>
                  </>
                )}
                <button className="px-1" onClick={() => mutate(it.id, { rot: (it as { rot: number }).rot - 8 })}>
                  ↺
                </button>
                <button className="px-1" onClick={() => mutate(it.id, { rot: (it as { rot: number }).rot + 8 })}>
                  ↻
                </button>
                <button className="px-1 text-destructive" onClick={() => remove(it.id)}>
                  ✕
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
