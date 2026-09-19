import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderHeart, Plus } from "lucide-react";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <div className="h-full overflow-auto scrapbook-surface p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="hand text-5xl text-espresso">Rooms</h1>
            <p className="mt-1 text-sm text-room-ink/55">Your little spaces for different kinds of ideas.</p>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-espresso/10 bg-paper px-4 py-2 text-sm text-espresso shadow-sm">
            <Plus className="h-4 w-4" /> New room
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/canvas" className="group rounded-2xl border border-espresso/10 bg-paper p-6 shadow-sm transition hover:-translate-y-1">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-rose/20 text-espresso">
              <FolderHeart className="h-6 w-6" />
            </div>
            <h2 className="hand text-3xl text-espresso">Main Room</h2>
            <p className="mt-2 text-sm leading-6 text-room-ink/55">Your main scrapbook workspace.</p>
            <span className="mt-5 inline-block text-xs font-medium text-espresso/65">Open room →</span>
          </Link>

          <div className="rounded-2xl border border-dashed border-espresso/15 bg-paper/45 p-6">
            <div className="hand text-2xl text-espresso/65">another room</div>
            <p className="mt-2 text-sm leading-6 text-room-ink/45">Create more spaces when you need them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
