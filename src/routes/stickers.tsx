import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const mood = useTimeMood("happy");
  const picked = usePickedSticker();
  const pickedSticker = picked ? STICKER_MAP[picked] : undefined;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      STICKERS.filter((sticker) => {
        const categoryMatch = cat === "all" || sticker.cat === cat;
        const queryMatch =
          !normalizedQuery ||
          sticker.label.toLowerCase().includes(normalizedQuery) ||
          CATEGORIES.find((c) => c.id === sticker.cat)?.label.toLowerCase().includes(normalizedQuery);
        return categoryMatch && queryMatch;
      }),
    [cat, normalizedQuery],
  );

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        stickers: filtered.filter((sticker) => sticker.cat === category.id),
      })).filter((group) => group.stickers.length > 0),
    [filtered],
  );

  const active = CATEGORIES.find((c) => c.id === cat);

  const choose = (id: string) => pickSticker(id);

  return (
    <div className="relative pb-10">
      <PageHeader title="sticker drawer" note={`${STICKERS.length} little paper things`} />

      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border/70 bg-paper/70 px-3 py-2 shadow-sm">
        <span aria-hidden className="text-lg text-ink-soft">⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="find a sticker..."
          aria-label="Search stickers"
          className="min-w-0 flex-1 bg-transparent font-sans text-sm text-espresso outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="hand text-lg text-muted-foreground hover:text-espresso"
            aria-label="Clear sticker search"
          >
            clear
          </button>
        )}
      </div>

      <div className="mb-4 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={cn(
            "hand shrink-0 rounded-full border px-3 py-1 text-lg transition-transform hover:-translate-y-0.5",
            cat === "all"
              ? "border-espresso/20 bg-secondary text-espresso shadow-sm"
              : "border-border/60 bg-paper/50 text-muted-foreground hover:text-espresso",
          )}
        >
          everything
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              "hand shrink-0 rounded-full border px-3 py-1 text-lg transition-transform hover:-translate-y-0.5",
              cat === c.id
                ? "border-espresso/15 text-espresso shadow-sm"
                : "border-border/60 bg-paper/50 text-muted-foreground hover:text-espresso",
            )}
            style={cat === c.id ? { background: c.tint } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>

      {active && !query && (
        <p className="hand mb-3 text-xl text-ink-soft">{active.note}</p>
      )}

      {pickedSticker && (
        <div className="paper-card mb-4 flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/70">
            <StickerArt id={pickedSticker.id} size={34} />
          </div>
          <span className="hand text-xl text-espresso">
            holding “{pickedSticker.label}” · tap a page to stick it down
          </span>
          <Link to="/ideas" className="hand text-xl underline decoration-wavy">
            idea dump
          </Link>
          <Link to="/" className="hand text-xl underline decoration-wavy">
            a note
          </Link>
          <button
            type="button"
            onClick={() => pickSticker(null)}
            className="hand text-xl text-muted-foreground hover:text-espresso"
          >
            put it back
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="paper-card paper-grain rounded-2xl px-6 py-12 text-center">
          <p className="hand text-3xl text-espresso">no sticker hiding here.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another word or browse everything.</p>
        </div>
      ) : cat === "all" && !normalizedQuery ? (
        <div className="space-y-5">
          {groups.map(({ category, stickers }) => (
            <section key={category.id} aria-labelledby={`sticker-group-${category.id}`}>
              <div className="mb-2 flex items-end justify-between gap-3 px-1">
                <div>
                  <h2
                    id={`sticker-group-${category.id}`}
                    className="hand text-2xl leading-none text-espresso"
                  >
                    {category.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{category.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCat(category.id)}
                  className="hand text-base text-muted-foreground underline decoration-wavy hover:text-espresso"
                >
                  see all
                </button>
              </div>
              <StickerGrid stickers={stickers} picked={picked} onPick={choose} compact />
            </section>
          ))}
        </div>
      ) : (
        <div>
          {normalizedQuery && (
            <p className="mb-2 px-1 text-xs text-muted-foreground">
              {filtered.length} sticker{filtered.length === 1 ? "" : "s"} found
            </p>
          )}
          <StickerGrid stickers={filtered} picked={picked} onPick={choose} />
        </div>
      )}

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

function StickerGrid({
  stickers,
  picked,
  onPick,
  compact = false,
}: {
  stickers: typeof STICKERS;
  picked: string | null;
  onPick: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "paper-card paper-grain grid rounded-2xl border p-3 sm:grid-cols-5 lg:grid-cols-8",
        compact ? "grid-cols-4 gap-1.5 md:grid-cols-7" : "grid-cols-3 gap-2 md:grid-cols-6 md:gap-2.5",
      )}
    >
      {stickers.map((sticker, i) => (
        <button
          key={sticker.id}
          type="button"
          title={`pick ${sticker.label}`}
          onClick={() => onPick(sticker.id)}
          className={cn(
            "sticker-pop group grid min-h-[76px] place-items-center gap-1 rounded-xl border border-transparent p-2 transition-all hover:-translate-y-1 hover:bg-secondary/45 hover:shadow-sm",
            picked === sticker.id && "border-rose/40 bg-secondary ring-1 ring-rose/40",
          )}
          style={{ transform: `rotate(${((i % 5) - 2) * 1.2}deg)` }}
        >
          <div className="grid min-h-12 place-items-center transition-transform group-hover:scale-105">
            <StickerArt id={sticker.id} size={Math.min(compact ? 52 : 60, sticker.size)} />
          </div>
          <span className="max-w-full truncate text-center text-[0.62rem] leading-tight text-muted-foreground group-hover:text-espresso">
            {sticker.label}
          </span>
        </button>
      ))}
    </div>
  );
}
