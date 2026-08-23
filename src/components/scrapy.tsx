import { useEffect, useState } from "react";
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
  | "proud"
  | "crying"
  | "celebrating";

export const ROOM_TAPE: Record<string, string> = {
  notes: "var(--rose)",
  pdfs: "var(--sky)",
  ideas: "var(--sage)",
  stickers: "var(--petal)",
  settings: "var(--amber)",
};

export function Scrapy({
  mood = "idle",
  tape = "var(--petal)",
  size = 64,
  bob = false,
}: {
  mood?: Mood | undefined;
  tape?: string | undefined;
  size?: number | undefined;
  bob?: boolean | undefined;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ overflow: "visible", animation: bob ? "bob 4.5s ease-in-out infinite" : undefined }}
    >
      <ScrapyBlob face={mood} tape={tape} />
    </svg>
  );
}

/** Floating companion with a little handwritten speech scrap. */
export function ScrapyCompanion({
  room,
  mood,
  line,
}: {
  room: keyof typeof ROOM_TAPE;
  mood: Mood;
  line: string;
}) {
  const on = useScrap((s) => s.settings.scrapyOn);
  const [show, setShow] = useState(true);
  const [visibleLine, setVisibleLine] = useState(line);

  useEffect(() => {
    setVisibleLine(line);
    setShow(true);
    const t = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(t);
  }, [line]);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex items-end gap-2">
      {show && (
        <div
          className="paper-card paper-grain max-w-[15rem] -rotate-2 px-3 py-2"
          style={{ borderRadius: 3 }}
        >
          <p className="hand text-[1.05rem] leading-tight text-espresso">{visibleLine}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="pointer-events-auto transition-transform hover:-translate-y-1"
        aria-label="scrapy"
      >
        <Scrapy mood={mood} tape={ROOM_TAPE[room]} size={70} bob />
      </button>
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
