import { memo, useEffect, useMemo, useState } from "react";
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

const TinyProp = memo(function TinyProp({ prop }: { prop: Prop }) {
  const ink = "var(--espresso)";
  switch (prop) {
    case "book":
      return (
        <g transform="translate(44 40) rotate(-8)">
          <path d="M0 0h9v11H0z" fill="var(--sky)" stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M9 0h9v11H9z" fill="var(--paper)" stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M9 0v11" stroke={ink} strokeWidth={1.2} />
        </g>
      );
    case "pen":
      return (
        <g transform="translate(46 30) rotate(24)">
          <path d="M0 0h4v14H0z" fill="var(--amber)" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M0 14l2 4 2-4" fill="var(--paper)" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      );
    case "highlighter":
      return (
        <g transform="translate(45 31) rotate(18)">
          <path d="M0 0h6v10H0z" fill="var(--petal)" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M0 10h6v5H0z" fill="var(--paper)" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
        </g>
      );
    case "sticker":
      return (
        <g transform="translate(43 40) rotate(-12)">
          <path d="M0 0h14v10H0z" fill="var(--sage)" stroke={ink} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M3 5h8" stroke={ink} strokeWidth={1.2} strokeLinecap="round" />
        </g>
      );
    case "mug":
      return (
        <g transform="translate(45 42)">
          <path d="M0 0h10v9a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3z" fill="var(--paper)" stroke={ink} strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M10 3c3 0 3 5 0 5" fill="none" stroke={ink} strokeWidth={1.4} />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(46 40)">
          <circle cx={5} cy={4} r={2} fill="var(--amber)" stroke={ink} strokeWidth={1.1} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={5} cy={0.4} rx={1.8} ry={2.6} fill="var(--petal)" stroke={ink} strokeWidth={1.1} transform={`rotate(${a} 5 4)`} />
          ))}
          <path d="M5 6v8" stroke="var(--forest)" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
});

export const Scrapy = memo(function Scrapy({
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
      style={{ overflow: "visible", animation: bob ? "bob 4.5s ease-in-out infinite" : undefined, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <ScrapyBlob face={mood} tape={tape} />
      <TinyProp prop={prop} />
    </svg>
  );
});

export type ScrapyCtx = {
  tool?: string;
  stickerId?: string | null;
  items?: number;
  page?: number;
  pageCount?: number;
  docName?: string;
  count?: number;
};

function prettySticker(id?: string | null) {
  return id ? id.replace(/^[a-z]+-/, "").replace(/-/g, " ") : "sticker";
}

function describeTool(tool?: string) {
  const names: Record<string, string> = {
    pen: "the pen",
    pencil: "the pencil",
    highlighter: "the highlighter",
    underline: "the underline tool",
    arrow: "the arrow tool",
    circle: "the circle tool",
    doodle: "the doodle tool",
    text: "the text tool",
    sticker: "the sticker tool",
    eraser: "the eraser",
    select: "the select tool",
  };
  return names[tool ?? ""] ?? tool;
}

/**
 * Builds commentary from the current situation. There is no timer and no
 * rotating script. A changed action/context creates the next observation.
 */
export function scrapyLines(room: string, ctx: ScrapyCtx = {}): string[] {
  const { tool, stickerId, items, page, pageCount, docName, count } = ctx;
  const out: string[] = [];

  if (tool === "sticker" && stickerId) {
    out.push(`you're holding the ${prettySticker(stickerId)}. deciding where it belongs?`);
  } else if (tool) {
    out.push(`you've got ${describeTool(tool)} out. let's see what you do with it.`);
  }

  if (typeof items === "number") {
    if (items === 0) out.push("still blank. i'm watching the first mark.");
    else if (items === 1) out.push("one little mark. we're officially started.");
    else if (items < 5) out.push(`${items} things on the page already. i see the idea forming.`);
    else if (items < 12) out.push(`${items} little things here now. this page is becoming yours.`);
    else out.push(`${items} things on this page. okay, this has personality now.`);
  }

  if (page && pageCount) {
    out.push(`you're on page ${page} of ${pageCount}.`);
  }

  if (docName) {
    out.push(`back to “${docName}”.`);
  }

  if (typeof count === "number") {
    if (room === "pdfs") out.push(count === 0 ? "your reading shelf is empty for now." : `${count} PDF${count === 1 ? "" : "s"} waiting on the shelf.`);
    if (room === "stickers") out.push(`${count} little things to choose from.`);
  }

  if (!out.length) {
    if (room === "notes") out.push("you're in the notes. i'm keeping an eye on the page.");
    else if (room === "pdfs") out.push("reading mode. got it.");
    else if (room === "ideas") out.push("idea dump. let the page get messy.");
    else if (room === "stickers") out.push("sticker drawer. i'm curious what you're picking.");
    else out.push("i'm here. carry on.");
  }

  return out;
}

export function ScrapyHere({
  room,
  mood: baseMood,
  lines: _legacyLines = [],
  ctx,
  prop = "none",
  size = 62,
  spots,
  flip = false,
  peek = false,
}: {
  room: keyof typeof ROOM_TAPE;
  mood: Mood;
  /** Kept for backwards compatibility. Scrapy no longer uses fixed dialogue. */
  lines?: string[];
  ctx?: ScrapyCtx;
  prop?: Prop;
  size?: number;
  spots: string[];
  flip?: boolean;
  peek?: boolean;
}) {
  const on = useScrap((s) => s.settings.scrapyOn);
  const [mood, setMood] = useState<Mood>(baseMood);
  const [line, setLine] = useState<string | null>(null);
  const [showLine, setShowLine] = useState(false);
  const [seen, setSeen] = useState(0);

  const sig = JSON.stringify(ctx ?? null);
  const pool = useMemo(() => scrapyLines(room, ctx ?? {}), [room, sig]);

  const nightly = useMemo(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 5;
  }, []);

  useEffect(() => {
    setMood(nightly ? "sleepy" : baseMood);
  }, [baseMood, nightly]);

  useEffect(() => {
    if (!on || !pool.length) return;
    const next = pool[seen % pool.length]!;
    setLine(next);
    setShowLine(true);
    setMood(nightly ? "sleepy" : pool.length > 1 ? "curious" : baseMood);
    setSeen((n) => n + 1);

    const t = window.setTimeout(() => setShowLine(false), 5200);
    return () => window.clearTimeout(t);
  }, [on, sig, pool, nightly, baseMood]);

  if (!on) return null;

  return (
    <div className={`pointer-events-none absolute z-20 select-none ${spots[0] ?? ""}`} style={{ opacity: peek ? 0.98 : 1 }}>
      <div className="relative flex items-end gap-1.5">
        {showLine && line && (
          <div className="paper-card paper-grain absolute bottom-[85%] right-0 w-max max-w-[13rem] -rotate-2 px-2.5 py-1.5" style={{ borderRadius: 3 }}>
            <p className="hand text-[1rem] leading-tight text-espresso">{line}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowLine((v) => !v)}
          className="pointer-events-auto transition-transform duration-300 hover:-translate-y-1"
          aria-label="scrapy"
          style={{ clipPath: peek ? "inset(0 0 22% 0)" : undefined }}
        >
          <Scrapy mood={mood} tape={ROOM_TAPE[room] ?? "var(--petal)"} size={size} prop={prop} flip={flip} bob={false} />
        </button>
      </div>
    </div>
  );
}

export function useTimeMood(base: Mood): Mood {
  const [mood, setMood] = useState<Mood>(base);
  useEffect(() => {
    const hour = new Date().getHours();
    setMood(hour >= 23 || hour < 5 ? "sleepy" : base);
  }, [base]);
  return mood;
}