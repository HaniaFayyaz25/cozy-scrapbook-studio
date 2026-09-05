import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { CATEGORIES, STICKERS, StickerArt, STICKER_MAP } from "@/lib/stickers";
import { pickSticker, usePickedSticker } from "@/lib/sticker-pick";
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
  const picked = usePickedSticker();
  const pickedSticker = picked ? STICKER_MAP[picked] : undefined;
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
            cat === "all"
              ? "bg-secondary text-espresso"
              : "text-muted-foreground hover:text-espresso",
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

      {pickedSticker && (
        <div className="paper-card mb-4 flex flex-wrap items-center gap-3 px-3 py-2">
          <StickerArt id={pickedSticker.id} size={34} />
          <span className="hand text-xl text-espresso">
            holding “{pickedSticker.label}” — tap a page to stick it down
          </span>
          <Link to="/ideas" className="hand text-xl underline decoration-wavy">
            idea dump
          </Link>
          <Link to="/" className="hand text-xl underline decoration-wavy">
            a note
          </Link>
          <button
            onClick={() => pickSticker(null)}
            className="hand text-xl text-muted-foreground hover:text-espresso"
          >
            put it back
          </button>
        </div>
      )}

      <div className="paper-card paper-grain grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 md:gap-4 md:p-5 lg:grid-cols-8">
        {list.map((s, i) => (
          <button
            key={s.id}
            title={`pick ${s.label}`}
            onClick={() => pickSticker(s.id)}
            className={cn(
              "sticker-pop grid place-items-center gap-1 rounded-[4px] p-2 transition-transform hover:-translate-y-1",
              picked === s.id && "bg-secondary ring-1 ring-rose",
            )}
            style={{ transform: `rotate(${((i % 5) - 2) * 1.4}deg)` }}
          >
            <StickerArt id={s.id} size={Math.min(56, s.size)} />
            <span className="text-center text-[0.65rem] leading-tight text-muted-foreground">
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <ScrapyHere
        room="stickers"
        mood={mood}
        prop="sticker"
        peek
        size={52}
        lines={[
          "the drawer is a bit full, sorry.",
          "i'm in here somewhere.",
          "take as many as you like.",
        ]}
        spots={["-bottom-4 right-12", "-top-3 left-1/3", "-bottom-3 left-8", "top-1/2 -right-7"]}
      />
    </div>
  );
}
