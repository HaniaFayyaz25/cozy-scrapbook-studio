import { useEffect, useMemo, useRef, useState } from "react";
import { ScrapyBlob } from "@/lib/stickers";
import { useScrap } from "@/lib/scrap-store";

export type Mood =
  | "idle"
  | "happy"
  | "greeting"
  | "curious"
  | "sleepy"
  | "excited"
  | "thinking"
  | "tired"
  | "surprised"
  | "shocked"
  | "confused"
  | "proud"
  | "crying"
  | "celebrating";

export type Prop = "none" | "book" | "pen" | "highlighter" | "sticker" | "mug" | "flower";

export const ROOM_TAPE: Record<string, string> = {
  notes: "var(--rose)",
  pdfs: "var(--sky)",
  ideas: "var(--sage)",
  stickers: "var(--petal)",
  settings: "var(--amber)",
};

/** tiny hand-drawn props that sit beside scrapy */
function TinyProp({ prop }: { prop: Prop }) {
  const ink = "var(--espresso)";
  switch (prop) {
    case "book":
      return (
        <g transform="translate(44 40) rotate(-8)">
          <path
            d="M0 0h9v11H0z"
            fill="var(--sky)"
            stroke={ink}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path
            d="M9 0h9v11H9z"
            fill="var(--paper)"
            stroke={ink}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path d="M9 0v11" stroke={ink} strokeWidth={1.2} />
        </g>
      );
    case "pen":
      return (
        <g transform="translate(46 30) rotate(24)">
          <path
            d="M0 0h4v14H0z"
            fill="var(--amber)"
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <path
            d="M0 14l2 4 2-4"
            fill="var(--paper)"
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </g>
      );
    case "highlighter":
      return (
        <g transform="translate(45 31) rotate(18)">
          <path
            d="M0 0h6v10H0z"
            fill="var(--petal)"
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <path
            d="M0 10h6v5H0z"
            fill="var(--paper)"
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </g>
      );
    case "sticker":
      return (
        <g transform="translate(43 40) rotate(-12)">
          <path
            d="M0 0h14v10H0z"
            fill="var(--sage)"
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <path d="M3 5h8" stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
        </g>
      );
    case "mug":
      return (
        <g transform="translate(45 42)">
          <path
            d="M0 0h10v9a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3z"
            fill="var(--paper)"
            stroke={ink}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path d="M10 3c3 0 3 5 0 5" fill="none" stroke={ink} strokeWidth={1.4} />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(46 40)">
          <circle cx={5} cy={4} r={2} fill="var(--amber)" stroke={ink} strokeWidth={1.1} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={5}
              cy={0.4}
              rx={1.8}
              ry={2.6}
              fill="var(--petal)"
              stroke={ink}
              strokeWidth={1.1}
              transform={`rotate(${a} 5 4)`}
            />
          ))}
          <path d="M5 6v8" stroke="var(--forest)" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

export function Scrapy({
  mood = "idle",
  tape = "var(--petal)",
  size = 64,
  bob = false,
  prop = "none",
  flip = false,
}: {
  mood?: Mood;
  tape?: string;
  size?: number;
  bob?: boolean;
  prop?: Prop;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{
        overflow: "visible",
        animation: bob ? "bob 4.5s ease-in-out infinite" : undefined,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <ScrapyBlob face={mood} tape={tape} />
      <TinyProp prop={prop} />
    </svg>
  );
}

const IDLE_MOODS: Mood[] = ["idle", "happy", "curious", "thinking", "proud"];

/**
 * A scrapy you can pick up and drop anywhere inside the nearest positioned
 * parent. Remembers where you left him (localStorage) and stays there.
 */
export function DraggableScrapy({
  storageKey,
  className = "",
  children,
}: {
  storageKey: string;
  /** default (undragged) positioning classes, e.g. "right-4 top-3" */
  className?: string;
  children?: React.ReactNode;
}) {
  // Start null on both server and client so hydration matches; the effect below
  // restores the saved spot right after mount.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(
    null,
  );

  // Re-read localStorage after hydration so SSR doesn't keep him pinned to default.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPos(JSON.parse(raw) as { x: number; y: number });
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!wrap || !parent) return;
    const w = wrap.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: w.left - p.left,
      oy: w.top - p.top,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!d || !wrap || !parent) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const maxX = parent.clientWidth - wrap.offsetWidth;
    const maxY = parent.clientHeight - wrap.offsetHeight;
    setPos({
      x: Math.min(Math.max(d.ox + dx, -6), Math.max(maxX, 0)),
      y: Math.min(Math.max(d.oy + dy, -6), Math.max(maxY, 0)),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d?.moved) {
      setPos((p) => {
        if (p) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(p));
          } catch {
            /* ignore */
          }
        }
        return p;
      });
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={wrapRef}
      role="button"
      aria-label="scrapy — drag me anywhere"
      data-pos={pos ? `${pos.x},${pos.y}` : "null"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`absolute z-30 cursor-grab touch-none select-none active:cursor-grabbing ${pos ? "" : className}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Scrapy living inside the composition. Placed absolutely inside a `relative`
 * parent using the given `spots`, drifting between them so he never feels pinned.
 */
export function ScrapyHere({
  room,
  mood: baseMood,
  lines = [],
  prop = "none",
  size = 62,
  spots,
  flip = false,
  peek = false,
}: {
  room: keyof typeof ROOM_TAPE;
  mood: Mood;
  lines?: string[];
  prop?: Prop;
  size?: number;
  /** tailwind positioning classes; scrapy drifts between them */
  spots: string[];
  flip?: boolean;
  /** tuck him partly behind the paper, like he's peeking */
  peek?: boolean;
}) {
  const on = useScrap((s) => s.settings.scrapyOn);
  const [i, setI] = useState(0);
  const [mood, setMood] = useState<Mood>(baseMood);
  const [line, setLine] = useState<string | null>(lines[0] ?? null);

  // user-dragged position (px, relative to the positioned parent) — once
  // scrapy is placed by hand he stays put instead of wandering
  const posKey = `scrapy-pos-${room}`;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(posKey);
      return raw ? (JSON.parse(raw) as { x: number; y: number }) : null;
    } catch {
      return null;
    }
  });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(
    null,
  );

  // Re-read localStorage after hydration so SSR doesn't keep him pinned to default.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(posKey);
      if (raw) setPos(JSON.parse(raw) as { x: number; y: number });
    } catch {
      /* ignore */
    }
  }, [posKey]);

  const nightly = useMemo(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 5;
  }, []);

  // arrive in the room with the contextual mood, then settle into idle states
  useEffect(() => {
    setMood(nightly ? "sleepy" : baseMood);
    const t = setTimeout(() => setMood(nightly ? "sleepy" : IDLE_MOODS[0]!), 8000);
    return () => clearTimeout(t);
  }, [baseMood, nightly]);

  // wander between spots + shift idle expression — only while the user hasn't
  // placed scrapy by hand
  useEffect(() => {
    if (pos) return;
    if (spots.length < 2 && lines.length < 2) return;
    const t = setInterval(() => {
      setI((v) => (v + 1) % Math.max(spots.length, 1));
      setLine(lines.length ? lines[Math.floor(Math.random() * lines.length)]! : null);
      if (!nightly) setMood(IDLE_MOODS[Math.floor(Math.random() * IDLE_MOODS.length)]!);
    }, 16000);
    return () => clearInterval(t);
  }, [spots.length, lines, nightly, pos]);

  // the little speech scrap only lingers a moment
  const [showLine, setShowLine] = useState(true);
  useEffect(() => {
    setShowLine(true);
    const t = setTimeout(() => setShowLine(false), 7000);
    return () => clearTimeout(t);
  }, [line]);

  if (!on) return null;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!wrap || !parent) return;
    const w = wrap.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: w.left - p.left,
      oy: w.top - p.top,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    const wrap = wrapRef.current;
    const parent = wrap?.offsetParent as HTMLElement | null;
    if (!d || !wrap || !parent) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    // keep him inside the room, roughly
    const maxX = parent.clientWidth - wrap.offsetWidth;
    const maxY = parent.clientHeight - wrap.offsetHeight * (peek ? 0.7 : 1);
    setPos({
      x: Math.min(Math.max(d.ox + dx, -8), Math.max(maxX, 0)),
      y: Math.min(Math.max(d.oy + dy, -8), Math.max(maxY, 0)),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved) {
      setPos((p) => {
        if (p) {
          try {
            localStorage.setItem(posKey, JSON.stringify(p));
          } catch {
            /* ignore */
          }
        }
        return p;
      });
    } else {
      // a simple tap still toggles the speech scrap
      setShowLine((v) => !v);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute z-20 select-none ${
        pos
          ? ""
          : `transition-all duration-[1200ms] ease-in-out ${spots[i % spots.length] ?? spots[0] ?? ""}`
      }`}
      style={
        pos ? { left: pos.x, top: pos.y, opacity: peek ? 0.98 : 1 } : { opacity: peek ? 0.98 : 1 }
      }
    >
      <div className="relative flex items-end gap-1.5">
        {showLine && line && (
          <div
            className="paper-card paper-grain absolute bottom-[85%] right-0 w-max max-w-[13rem] -rotate-2 px-2.5 py-1.5"
            style={{ borderRadius: 3 }}
          >
            <p className="hand text-[1rem] leading-tight text-espresso">{line}</p>
          </div>
        )}
        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="pointer-events-auto cursor-grab touch-none transition-transform duration-300 hover:-translate-y-1 active:cursor-grabbing"
          aria-label="scrapy — drag me anywhere"
          style={{ clipPath: peek ? "inset(0 0 22% 0)" : undefined }}
        >
          <Scrapy
            mood={mood}
            tape={ROOM_TAPE[room] ?? "var(--petal)"}
            size={size}
            prop={prop}
            flip={flip}
            bob
          />
        </button>
      </div>
    </div>
  );
}

export function useTimeMood(base: Mood): Mood {
  const [mood, setMood] = useState<Mood>(base);
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      setMood("sleepy");
      return;
    }
    setMood(base);
    const t = setTimeout(() => setMood("idle"), 9000);
    return () => clearTimeout(t);
  }, [base]);
  return mood;
}
