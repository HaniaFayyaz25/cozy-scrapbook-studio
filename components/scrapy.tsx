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

function TinyProp({ prop }: { prop: Prop }) {
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

export type ScrapyCtx = {
  tool?: string;
  stickerId?: string | null;
  items?: number;
  page?: number;
  pageCount?: number;
  docName?: string;
  count?: number;
};

const TOOL_LINES: Record<string, string[]> = {
  pen: ["nice line.", "that one has character.", "keep going.", "ink before you forget it."],
  pencil: ["pencil today?", "change your mind if you want.", "soft marks. good choice."],
  highlighter: ["that bit matters.", "tiny sunshine for the important part.", "you found the good bit."],
  underline: ["underlined. officially important.", "straight-ish is still straight enough."],
  arrow: ["there it is.", "connecting the dots.", "follow that thought."],
  circle: ["circled.", "yep, that deserves attention.", "little loop of importance."],
  text: ["type it. i'll wait.", "words belong here too.", "put the thought somewhere safe."],
  sticker: ["still holding it. tap again for another.", "one click, one sticker. i'm ready.", "place it wherever you like."],
  eraser: ["tidying up?", "gone. clean slate.", "making room."],
  select: ["move it wherever it feels right.", "nothing is glued down here.", "little rearrangement?"],
};

function prettySticker(id?: string | null) {
  return id ? id.replace(/^[a-z]+-/, "").replace(/-/g, " ") : "";
}

function addUnique(out: string[], values: string[]) {
  for (const value of values) if (!out.includes(value)) out.push(value);
}

export function scrapyLines(room: string, ctx: ScrapyCtx = {}, fallback: string[] = []): string[] {
  const out: string[] = [];
  const { tool, stickerId, items, page, pageCount, docName, count } = ctx;

  if (tool === "sticker" && stickerId) {
    out.push(`the ${prettySticker(stickerId)} is ready. tap when you want it.`);
  }
  if (tool && TOOL_LINES[tool]) addUnique(out, TOOL_LINES[tool]!);

  if (typeof items === "number") {
    if (items === 0) addUnique(out, ["blank page. lovely.", "you can start anywhere."]);
    else if (items < 4) addUnique(out, ["good start.", "it's taking shape."]);
    else if (items < 15) addUnique(out, ["okay, this page has a personality now.", "i like where this is going."]);
    else addUnique(out, ["this page is wonderfully full.", "you've been busy."]);
  }

  if (page && pageCount) {
    if (page === 1) out.push(`page one of ${pageCount}. we're starting.`);
    else if (page === pageCount) out.push("last page. you made it.");
    else out.push(`page ${page} of ${pageCount}. still here.`);
  }

  if (docName) out.push(`"${docName}". let's work on this one.`);
  if (typeof count === "number") {
    if (room === "pdfs") out.push(count === 0 ? "nothing on the shelf yet." : `${count} on the shelf.`);
    if (room === "stickers") out.push(`${count} little things in here.`);
  }

  if (!out.length) addUnique(out, fallback);
  if (!out.length) out.push("i'm here. take your time.");
  return out;
}

function pickFresh(pool: string[], previous: string | null) {
  if (pool.length <= 1) return pool[0] ?? previous;
  const available = pool.filter((x) => x !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? pool[0];
}

/** Scrapy is a persistent little mascot. It can be dragged, but never wanders by itself. */
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
  spots: string[];
  flip?: boolean;
  peek?: boolean;
}) {
  const on = useScrap((s) => s.settings.scrapyOn);
  const [mood, setMood] = useState<Mood>(baseMood);
  const [line, setLine] = useState<string | null>(null);
  const [showLine, setShowLine] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const sig = JSON.stringify(ctx ?? null);
  const pool = useMemo(() => scrapyLines(room, ctx ?? {}, lines), [room, sig, lines]);

  const nightly = useMemo(() => {
    const h = new Date().getHours();
    return h >= 23 || h < 5;
  }, []);

  // Mood follows the situation. It does not randomly change every few seconds.
  useEffect(() => {
    setMood(nightly ? "sleepy" : baseMood);
  }, [baseMood, nightly]);

  // New context gets a new line. The mascot no longer talks on a random timer.
  useEffect(() => {
    const next = pickFresh(pool, line);
    setLine(next ?? null);
    setShowLine(true);
  }, [pool]);

  // Reset only the position when the room itself changes. Scrapy keeps its place while working.
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [room]);

  const cycleLine = () => {
    setLine((previous) => pickFresh(pool, previous) ?? null);
    setShowLine(true);
    setMood(nightly ? "sleepy" : "happy");
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setMood(nightly ? "sleepy" : "curious");
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    setPosition({
      x: d.originX + e.clientX - d.startX,
      y: d.originY + e.clientY - d.startY,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    drag.current = null;
    setDragging(false);
    if (moved < 6) cycleLine();
    else setMood(nightly ? "sleepy" : "proud");
  };

  if (!on) return null;

  return (
    <div
      className={`pointer-events-none absolute z-20 select-none ${spots[0] ?? ""}`}
      style={{
        opacity: peek ? 0.98 : 1,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: dragging ? "none" : "transform 180ms ease-out",
      }}
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
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
          }}
          className={`pointer-events-auto touch-none select-none transition-transform duration-200 ${dragging ? "scale-105 cursor-grabbing" : "cursor-grab hover:-translate-y-1"}`}
          aria-label="Drag Scrapy or tap him to change what he says"
          style={{ clipPath: peek ? "inset(0 0 22% 0)" : undefined }}
        >
          <Scrapy
            mood={mood}
            tape={ROOM_TAPE[room] ?? "var(--petal)"}
            size={size}
            prop={prop}
            flip={flip}
            bob={false}
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
    setMood(hour >= 23 || hour < 5 ? "sleepy" : base);
  }, [base]);
  return mood;
}
