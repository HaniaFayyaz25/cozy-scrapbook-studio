import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Scrapy } from "@/components/scrapy";
import { StickerArt } from "@/lib/stickers";
import { actions, useScrap, type Note } from "@/lib/scrap-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notes shelf — Scrap" },
      {
        name: "description",
        content:
          "Your paper shelf of notes: taped cards, doodles in the margins and stickers stuck wherever they landed.",
      },
      { property: "og:title", content: "Notes shelf — Scrap" },
      {
        property: "og:description",
        content: "A cozy shelf of hand-made notes, doodles and marginalia.",
      },
    ],
  }),
  component: NotesShelf,
});

function preview(n: Note) {
  const text = n.pages.map((p) => p.text).join(" ").trim();
  return text ? text.slice(0, 90) : "";
}

function NotesShelf() {
  const notes = useScrap((s) => s.notes);
  const navigate = useNavigate();

  const create = () => {
    const id = actions.createNote();
    navigate({ to: "/notes/$noteId", params: { noteId: id } });
  };

  return (
    <div className="relative">
      <PageHeader title="notes" />

      <div className="grid grid-cols-1 gap-2.5 pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((n, i) => (
          <div key={n.id} className="group relative">
            <Link
              to="/notes/$noteId"
              params={{ noteId: n.id }}
              className="paper-card paper-grain ruled-lines relative block h-40 overflow-hidden rounded-[5px] p-2.5 pt-4 transition-transform hover:-translate-y-0.5 hover:-rotate-[0.6deg]"
              style={{ transform: `rotate(${((i % 3) - 1) * 0.5}deg)` }}
            >
              {/* torn washi strip hanging off the top-left corner */}
              <span
                className="absolute -left-2 -top-2 h-6 w-12 -rotate-[28deg] opacity-90"
                style={{
                  background: n.tape,
                  clipPath:
                    "polygon(0 8%,12% 0,28% 10%,45% 2%,62% 11%,80% 3%,100% 10%,100% 92%,82% 100%,64% 90%,46% 99%,28% 89%,12% 98%,0 90%)",
                }}
              />
              <h2 className="hand relative text-[1.15rem] leading-tight text-espresso">{n.title}</h2>
              <p className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-ink-soft">{preview(n)}</p>

              {/* scrapy sitting on the page beside a tiny flower */}
              <span className="absolute bottom-1 left-2">
                <Scrapy mood="happy" tape={n.tape} size={34} />
              </span>
              <span className="absolute bottom-2 right-3 opacity-90">
                <StickerArt id={i % 2 ? "b-daisy" : "m-star"} size={22} />
              </span>
            </Link>
            <button
              aria-label="throw away"
              onClick={() => actions.deleteNote(n.id)}
              className="absolute right-1.5 top-1.5 rounded-[3px] p-1 text-ink-soft opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
            </button>
          </div>
        ))}

        <button
          onClick={create}
          className="flex h-40 flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-room-ink/25 bg-room-pill/40 text-room-ink/60 transition-colors hover:border-room-ink/45 hover:text-room-ink"
        >
          <Plus className="h-5 w-5" strokeWidth={1.6} />
          <span className="text-[0.72rem]">new page</span>
        </button>
      </div>
    </div>
  );
}
