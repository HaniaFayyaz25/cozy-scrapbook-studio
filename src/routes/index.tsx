import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { Scrapy } from "@/components/scrapy";
import { StickerArt } from "@/lib/stickers";
import { actions, useScrap, type Note } from "@/lib/scrap-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notes shelf — Scrap" },
      { name: "description", content: "Your cozy paper shelf of notes, doodles and little ideas." },
    ],
  }),
  component: NotesShelf,
});

function preview(n: Note) {
  const text = n.pages.map((p) => p.text).join(" ").trim();
  return text ? text.slice(0, 120) : "";
}

function NotesShelf() {
  const notes = useScrap((s) => s.notes);
  const navigate = useNavigate();

  const create = () => {
    const id = actions.createNote();
    navigate({ to: "/notes/$noteId", params: { noteId: id } });
  };

  return (
    <div className="relative h-full overflow-auto scrapbook-surface">
      <div className="mx-auto min-h-full max-w-[1500px] p-4 md:p-6">
        <div className="relative mb-5">
          <div className="inline-flex rotate-[-2deg] items-center gap-3 rounded-sm border border-espresso/10 bg-paper px-6 py-2.5 shadow-md">
            <span className="text-2xl text-petal">✿</span>
            <h1 className="hand text-4xl leading-none text-espresso md:text-5xl">Notes</h1>
            <span className="text-2xl text-rose">♥</span>
          </div>
          <span className="absolute -left-1 top-[-10px] h-5 w-16 rotate-[-8deg] bg-amber/45" />
          <span className="absolute left-[38%] top-3 hidden text-2xl text-espresso/45 md:block">⌁</span>
        </div>

        <div className="relative grid min-h-[calc(100dvh-155px)] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="relative overflow-hidden rounded-[22px] border border-espresso/10 bg-paper/25 p-4 shadow-inner md:p-7">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <span className="absolute left-2 top-24 text-6xl text-forest/35">❧</span>
              <span className="absolute right-8 top-16 text-5xl text-espresso/50">♡</span>
              <span className="absolute left-[48%] bottom-8 text-4xl text-espresso/45">✦</span>
              <span className="absolute right-6 bottom-16 text-5xl text-espresso/45">♡</span>
            </div>

            <div className="relative grid grid-cols-1 gap-7 md:grid-cols-2">
              {notes.map((n, i) => (
                <div key={n.id} className="group relative">
                  <Link
                    to="/notes/$noteId"
                    params={{ noteId: n.id }}
                    className="paper-card paper-grain relative block min-h-[220px] overflow-hidden rounded-[4px] p-6 pt-9 transition-transform hover:-translate-y-1"
                    style={{ transform: `rotate(${((i % 3) - 1) * 1.1}deg)` }}
                  >
                    <span
                      className="absolute -left-3 -top-2 h-8 w-24 rotate-[-7deg] opacity-85"
                      style={{ background: n.tape, clipPath: "polygon(0 8%,10% 0,22% 8%,35% 2%,50% 10%,65% 1%,82% 8%,100% 0,100% 88%,84% 100%,66% 90%,50% 98%,32% 90%,16% 100%,0 91%)" }}
                    />
                    <h2 className="hand text-3xl leading-none text-espresso">{n.title}</h2>
                    <div className="my-4 h-px bg-sky/35" />
                    <p className="font-serif text-sm leading-7 text-ink-soft">{preview(n) || "a blank little page waiting for you..."}</p>
                    <span className="absolute bottom-4 left-5"><Scrapy mood="happy" tape={n.tape} size={48} /></span>
                    <span className="absolute bottom-4 right-5"><StickerArt id={i % 2 ? "b-daisy" : "m-star"} size={28} /></span>
                    <span className="absolute bottom-3 right-14 text-xl text-amber">✦</span>
                  </Link>
                  <button
                    aria-label="throw away"
                    onClick={() => actions.deleteNote(n.id)}
                    className="absolute right-2 top-2 rounded-full bg-paper/80 p-1.5 text-ink-soft opacity-0 shadow-sm transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
                  </button>
                </div>
              ))}

              <button
                onClick={create}
                className="relative flex min-h-[220px] rotate-[1deg] flex-col items-center justify-center overflow-hidden rounded-[5px] border border-espresso/10 bg-petal/45 text-espresso shadow-md transition-transform hover:-translate-y-1"
              >
                <span className="absolute right-5 top-4 text-2xl text-rose/70">♡</span>
                <span className="absolute left-5 top-5 h-7 w-20 rotate-[-5deg] bg-forest/20" />
                <Plus className="h-9 w-9" strokeWidth={1.5} />
                <span className="hand mt-2 text-2xl">new page</span>
                <span className="mt-1 text-xs text-ink-soft">start another little idea</span>
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-[-20px] left-[-20px] h-36 w-72 rotate-[3deg] bg-rose/10" />
          </section>

          <aside className="relative hidden overflow-hidden rounded-[22px] border border-espresso/10 bg-paper/45 p-4 shadow-sm lg:block">
            <div className="mb-3 flex items-center justify-between border-b border-espresso/10 pb-3">
              <h2 className="hand text-2xl text-espresso">little things</h2>
              <span className="text-xl text-rose">♡</span>
            </div>

            <div className="space-y-4">
              <div className="rotate-[-1deg] border border-espresso/10 bg-paper p-4 shadow-sm">
                <div className="hand text-xl text-espresso">today:</div>
                <div className="mt-2 space-y-1.5 font-serif text-sm text-espresso">
                  <div>□ study</div><div>□ read</div><div>□ create</div><div>□ be proud ♡</div>
                </div>
              </div>

              <div className="rotate-[2deg] border border-espresso/10 bg-rose/20 p-4 text-center shadow-sm">
                <div className="hand text-xl text-espresso">better things<br />take time ♡</div>
              </div>

              <div className="border border-espresso/10 bg-amber/20 p-4 text-center shadow-sm">
                <div className="hand text-lg text-espresso">“A little progress each day<br />adds up to big results.”</div>
              </div>

              <div className="relative min-h-[170px] overflow-hidden rounded-xl border border-espresso/10 bg-paper-deep/60 p-3">
                <div className="hand text-xl text-espresso">scrapy says...</div>
                <p className="mt-2 font-serif text-sm leading-6 text-ink-soft">keep making little things. they become big things.</p>
                <div className="absolute bottom-[-5px] right-2"><Scrapy mood="happy" size={92} /></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
