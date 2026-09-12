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

/** what the user is doing right now — scrapy talks about this */
export type ScrapyCtx = {
  /** current tool id, when a canvas is on screen */
  tool?: string;
  /** sticker currently held */
  stickerId?: string | null;
  /** how many things are on the current surface */
  items?: number;
  /** pdf / note paging */
  page?: number;
  pageCount?: number;
  /** the thing being worked on */
  docName?: string;
  /** shelf / drawer counts */
  count?: number;
};

const TOOL_LINES: Record<string, string[]> = {
  pen: ["nice line. keep going.", "pen suits you.", "ink it before you forget it."],
  pencil: ["soft pencil today? cosy.", "pencil means you can change your mind."],
  highlighter: [
    "that bit deserves a highlight.",
    "the highlighter straightens itself, promise.",
    "colour first, read later.",
  ],
  underline: ["underline it twice if it matters.", "straight-ish lines are still lines."],
  arrow: ["arrows always point at the good bit.", "connect those two thoughts."],
  circle: ["circle it. future you will thank you.", "a little loop around the important part."],
  text: ["type it out, i'm listening.", "words go anywhere on the page here."],
  sticker: [
    "tap wherever you want it — as many as you like.",
    "still holding it for you. click again for another.",
    "stickers make anything look finished.",
  ],
  eraser: ["tidying up? i'll hold the crumbs.", "gone. no one saw it."],
  select: ["drag things around, nothing is glued down.", "move it until it feels right."],
};

function prettySticker(id?: string | null) {
  return id ? id.replace(/^[a-z]+-/, "").replace(/-/g, " ") : "";
}

/** builds fresh, situation-aware dialogue instead of one fixed line */
export function scrapyLines(room: string, ctx: ScrapyCtx = {}, fallback: string[] = []): string[] {
  const out: string[] = [];
  const { tool, stickerId, items, page, pageCount, docName, count } = ctx;

  if (tool === "sticker" && stickerId) {
    out.push(`holding the ${prettySticker(stickerId)} — tap to stick it down.`);
  }
  if (tool && TOOL_LINES[tool]) out.push(...TOOL_LINES[tool]!);

  if (typeof items === "number") {
    if (items === 0) out.push("blank page. my favourite kind.", "go on, make the first mark.");
    else if (items < 4) out.push("good start.", "it's taking shape already.");
    else if (items < 15) out.push("this page is getting a personality.");
    else out.push("gloriously messy. exactly right.", "no space left? make another page.");
  }

  if (page && pageCount) {
    if (page === 1) out.push(`page one of ${pageCount}. tea first?`);
    else if (page === pageCount) out.push("last page. how was it?");
    else out.push(`page ${page} — still with you.`);
  }

  if (docName) out.push(`"${docName}" — the margins are the best part.`);
  if (typeof count === "number") {
    if (room === "pdfs") out.push(count === 0 ? "nothing to read yet." : `${count} on the shelf.`);
    if (room === "stickers") out.push(`${count} little things in here.`);
  }

  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) out.push("it's late. one more line, then bed?");
  else if (hour < 9) out.push("morning. the paper's still warm.");

  return out.length ? out : fallback;
}

/**
 * Scrapy living inside the composition — one fixed spot, not draggable.
 * His dialogue reacts to whatever the user is doing.
 */
export function ScrapyHere({
  room,
  mood: baseMood,
  lines = [],
  ctx,
  prop = "none",
  size = 62,
  spots,
  flip = false,
  peek = false,
}: {
  room: keyof typeof ROOM_TAPE;
  mood: Mood;
  lines?: string[];
  ctx?: ScrapyCtx;
  prop?: Prop;
  size?: number;
  /** tailwind positioning classes; the first one is used */
  spots: string[];
  flip?: boolean;
  /** tuck him partly behind the paper, like he's peeking */
  peek?: boolean;
}) {
  const on = useScrap((s) => s.settings.scrapyOn);
  const [mood, setMood] = useState<Mood>(baseMood);
  const [line, setLine] = useState<string | null>(null);
  const [showLine, setShowLine] = useState(true);

  const sig = JSON.stringify(ctx ?? null);
  const pool = useMemo(() => scrapyLines(room, ctx ?? {}, lines), [room, sig, lines]);

  const nightly = useMemo(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 5;
  }, []);

  // arrive with the contextual mood, then settle
  useEffect(() => {
    setMood(nightly ? "sleepy" : baseMood);
    const t = setTimeout(() => setMood(nightly ? "sleepy" : IDLE_MOODS[0]!), 8000);
    return () => clearTimeout(t);
  }, [baseMood, nightly]);

  // say something fresh whenever the situation changes, then keep chatting
  useEffect(() => {
    if (!pool.length) return;
    setLine(pool[Math.floor(Math.random() * pool.length)]!);
    setShowLine(true);
    const t = setInterval(() => {
      setLine(pool[Math.floor(Math.random() * pool.length)]!);
      setShowLine(true);
      if (!nightly) setMood(IDLE_MOODS[Math.floor(Math.random() * IDLE_MOODS.length)]!);
    }, 14000);
    return () => clearInterval(t);
  }, [pool, nightly]);

  // the little speech scrap only lingers a moment
  useEffect(() => {
    if (!showLine) return;
    const t = setTimeout(() => setShowLine(false), 7000);
    return () => clearTimeout(t);
  }, [line, showLine]);

  if (!on) return null;

  return (
    <div
      className={`pointer-events-none absolute z-20 select-none ${spots[0] ?? ""}`}
      style={{ opacity: peek ? 0.98 : 1 }}
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
          onClick={() => setShowLine((v) => !v)}
          className="pointer-events-auto transition-transform duration-300 hover:-translate-y-1"
          aria-label="scrapy"
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
