import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { CATEGORIES, STICKERS, StickerArt } from "@/lib/stickers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stickers")({
  head: () => ({
    meta: [
      { title: "Sticker drawer — Scrap" },
      {
        name: "description",
        content:
          "Browse the hand-drawn sticker drawer: marginalia, emotional damage, reading reactions, washi tape and botanicals.",
      },
      { property: "og:title", content: "Sticker drawer — Scrap" },
      { property: "og:description", content: "Every hand-drawn sticker in Scrap, sorted by mood." },
    ],
  }),
  component: StickerDrawer,
});

function StickerDrawer() {
  const [cat, setCat] = useState<string | "all">("all");
  const mood = useTimeMood("happy");
  const list = STICKERS.filter((s) => cat === "all" || s.cat === cat);
  const active = CATEGORIES.find((c) => c.id === cat);

  return (
    <div className="relative pb-16">
      <PageHeader title="sticker drawer" note={`${STICKERS.length} little paper things`} />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setCat("all")}
          className={cn(
            "hand rounded-[3px] px-2.5 py-0.5 text-xl transition-colors",
            cat === "all" ? "bg-secondary text-espresso" : "text-muted-foreground hover:text-espresso",
          )}
        >
          everything
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "hand rounded-[3px] px-2.5 py-0.5 text-xl transition-colors",
              cat === c.id ? "text-espresso" : "text-muted-foreground hover:text-espresso",
            )}
            style={cat === c.id ? { background: c.tint } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>

      {active && <p className="hand mb-4 text-xl text-ink-soft">{active.note}</p>}

      <div className="paper-card paper-grain grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 md:gap-4 md:p-5 lg:grid-cols-8">
        {list.map((s, i) => (
          <div
            key={s.id}
            title={s.label}
            className="sticker-pop grid place-items-center gap-1 rounded-[4px] p-2 transition-transform hover:-translate-y-1"
            style={{ transform: `rotate(${((i % 5) - 2) * 1.4}deg)` }}
          >
            <StickerArt id={s.id} size={Math.min(56, s.size)} />
            <span className="text-center text-[0.65rem] leading-tight text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <ScrapyHere
        room="stickers"
        mood={mood}
        prop="sticker"
        peek
        size={52}
        lines={["the drawer is a bit full, sorry.", "i'm in here somewhere.", "take as many as you like."]}
        spots={["-bottom-4 right-12", "-top-3 left-1/3", "-bottom-3 left-8", "top-1/2 -right-7"]}
      />
    </div>
  );
}
