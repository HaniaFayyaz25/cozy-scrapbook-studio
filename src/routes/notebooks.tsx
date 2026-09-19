import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Plus } from "lucide-react";
import { useScrap } from "@/lib/scrap-store";

export const Route = createFileRoute("/notebooks")({
  component: NotebooksPage,
});

function NotebooksPage() {
  const notes = useScrap((s) => s.notes);

  return (
    <div className="h-full overflow-auto scrapbook-surface p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="hand text-5xl text-espresso">Notebooks</h1>
            <p className="mt-1 text-sm text-room-ink/55">Keep your pages together, without losing the paper feel.</p>
          </div>
          <Link to="/canvas" className="flex items-center gap-2 rounded-full border border-espresso/10 bg-paper px-4 py-2 text-sm text-espresso shadow-sm">
            <Plus className="h-4 w-4" /> New notebook
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/canvas" className="rounded-2xl border border-espresso/10 bg-paper p-6 shadow-sm transition hover:-translate-y-1">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-amber/20 text-espresso">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="hand text-3xl text-espresso">My Scrapbook</h2>
            <p className="mt-2 text-sm text-room-ink/55">{notes.length} page{notes.length === 1 ? "" : "s"} saved</p>
            <span className="mt-5 inline-block text-xs font-medium text-espresso/65">Open notebook →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
