import { useEffect, useMemo, useState } from "react";
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

  // wander between spots + shift idle expression, so nothing is mechanically static
  useEffect(() => {
    if (spots.length < 2 && lines.length < 2) return;
    const t = setInterval(() => {
      setI((v) => (v + 1) % Math.max(spots.length, 1));
      setLine(lines.length ? lines[Math.floor(Math.random() * lines.length)]! : null);
      if (!nightly) setMood(IDLE_MOODS[Math.floor(Math.random() * IDLE_MOODS.length)]!);
    }, 16000);
    return () => clearInterval(t);
  }, [spots.length, lines, nightly]);

  // the little speech scrap only lingers a moment
  const [showLine, setShowLine] = useState(true);
  useEffect(() => {
    setShowLine(true);
    const t = setTimeout(() => setShowLine(false), 7000);
    return () => clearTimeout(t);
  }, [line]);

  if (!on) return null;

  return (
    <div
      className={`pointer-events-none absolute z-20 select-none transition-all duration-[1200ms] ease-in-out ${
        spots[i % spots.length] ?? spots[0] ?? ""
      }`}
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
          <Scrapy mood={mood} tape={ROOM_TAPE[room] ?? "var(--petal)"} size={size} prop={prop} flip={flip} bob />
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
