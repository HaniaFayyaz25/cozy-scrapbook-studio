import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
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

const TAPES = ["var(--petal)", "var(--sage)", "var(--sky)", "var(--amber)", "var(--rose)"];

function preview(n: Note) {
  const text = n.pages.map((p) => p.text).join(" ").trim();
  return text ? text.slice(0, 120) : "an empty page, waiting.";
}

function NotesShelf() {
  const notes = useScrap((s) => s.notes);
  const navigate = useNavigate();
  const mood = useTimeMood("greeting");

  const create = () => {
    const id = actions.createNote();
    navigate({ to: "/notes/$noteId", params: { noteId: id } });
  };

  return (
    <div className="relative">
      <PageHeader
        title="notes"
        note={`${notes.length} ${notes.length === 1 ? "page" : "pages"} on the shelf`}
        right={
          <button
            onClick={create}
            className="hand flex items-center gap-1.5 rounded-[4px] bg-primary px-3.5 py-1.5 text-xl text-primary-foreground transition-transform hover:-rotate-1"
          >
            <Plus className="h-4 w-4" strokeWidth={2} /> new page
          </button>
        }
      />

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((n, i) => (
          <div key={n.id} className="relative">
            <Link
              to="/notes/$noteId"
              params={{ noteId: n.id }}
              className="paper-card paper-grain ruled-lines block h-44 p-3.5 pt-5 transition-transform hover:-translate-y-1 hover:-rotate-[0.7deg]"
              style={{ transform: `rotate(${((i % 3) - 1) * 0.6}deg)` }}
            >
              <span
                className="absolute -top-2.5 left-6 h-5 w-16 -rotate-6 opacity-90"
                style={{ background: TAPES[i % TAPES.length] }}
              />
              <h2 className="hand text-2xl leading-none text-espresso">{n.title}</h2>
              <p className="mt-2 line-clamp-4 text-[0.85rem] leading-relaxed text-ink-soft">
                {preview(n)}
              </p>
              <span className="absolute bottom-2 right-3 text-[0.7rem] text-muted-foreground">
                {new Date(n.updatedAt).toLocaleDateString()}
              </span>
              <span className="absolute -bottom-3 -right-2 opacity-90">
                <StickerArt id={i % 2 ? "b-daisy" : "m-star"} size={38} />
              </span>
            </Link>
            <button
              aria-label="throw away"
              onClick={() => actions.deleteNote(n.id)}
              className="absolute right-2 top-2 rounded-[3px] p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100 hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </div>
        ))}

        <button
          onClick={create}
          className="grid h-44 place-items-center rounded-[6px] border border-dashed border-espresso/25 text-muted-foreground transition-colors hover:border-espresso/50 hover:text-espresso"
        >
          <span className="hand text-xl">+ start a fresh page</span>
        </button>
      </div>

      <ScrapyHere
        room="notes"
        mood={mood}
        prop="flower"
        peek
        size={58}
        lines={[
          "hi! what are we scribbling today?",
          "i tidied nothing. sorry.",
          "this shelf smells like paper.",
        ]}
        spots={["top-8 right-1/4", "bottom-8 left-1/3", "top-1/2 -left-8", "bottom-4 right-1/4"]}
      />
    </div>
  );
}
