import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Circle,
  Copy,
  Hand,
  Image as ImageIcon,
  Layers3,
  MoreHorizontal,
  PenLine,
  Redo2,
  Search,
  SquareMousePointer,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { ScrapCanvas, useCanvasHistory } from "@/components/scrap-canvas";
import { defaultToolState } from "@/components/tool-belt";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { CATEGORIES, STICKERS, StickerArt } from "@/lib/stickers";
import { pickSticker } from "@/lib/sticker-pick";
import { actions, useScrap, type CanvasItem } from "@/lib/scrap-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Canvas — Scrap" },
      { name: "description", content: "A cozy scrapbook canvas for notes, doodles and stickers." },
    ],
  }),
  component: NotePageView,
});

const toolbar = [
  { id: "select", label: "Select", icon: SquareMousePointer },
  { id: "text", label: "Text", icon: Type },
  { id: "pen", label: "Pen", icon: PenLine },
  { id: "pencil", label: "Pencil", icon: PenLine },
];

function DecorativePaper() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden scrapbook-surface">
      <div className="absolute left-[4%] top-[5%] w-44 rotate-[-5deg] rounded-sm border border-espresso/10 bg-rose/35 px-5 py-4 shadow-md">
        <div className="hand text-[1.45rem] leading-tight text-espresso">same girl...<br />bigger dreams ♡</div>
      </div>
      <div className="absolute left-[7%] top-[3%] h-7 w-20 rotate-[-24deg] rounded-sm bg-amber/55" />

      <div className="absolute left-[24%] top-[12%] h-[220px] w-[180px] rotate-[-2deg] border-[8px] border-paper bg-paper shadow-xl">
        <div className="scrapbook-photo h-full w-full" />
        <div className="absolute -top-5 left-1/2 h-7 w-20 -translate-x-1/2 rotate-[1deg] bg-amber/45" />
      </div>

      <div className="absolute right-[24%] top-[7%] h-[105px] w-[125px] rotate-[-6deg] border-[7px] border-paper bg-paper shadow-lg">
        <div className="scrapbook-photo h-full w-full" />
      </div>
      <div className="absolute right-[10%] top-[15%] h-[125px] w-[105px] rotate-[8deg] border-[7px] border-paper bg-paper shadow-lg">
        <div className="scrapbook-photo h-full w-full" />
      </div>

      <div className="absolute left-[4%] top-[40%] h-32 w-10 rotate-[7deg] rounded-full bg-sage/60 blur-[1px]" />
      <div className="absolute left-[2%] top-[48%] font-serif text-5xl text-forest/60">✿</div>
      <div className="absolute right-[5%] top-[6%] rotate-[12deg] text-6xl text-forest/55">❧</div>

      <div className="absolute left-[7%] bottom-[13%] w-[190px] rotate-[-2deg] border-[7px] border-paper bg-paper p-2 shadow-xl">
        <div className="h-28 rounded-sm bg-gradient-to-br from-espresso/70 via-amber/35 to-sage/55" />
        <div className="mt-1 grid gap-0.5 text-center font-serif text-[10px] text-espresso">
          <span>Zindagi Gulzar Hai</span><span>Yakeen Ka Safar</span><span>Alif</span><span>Ehd-e-Wafa</span>
        </div>
      </div>

      <div className="absolute right-[35%] top-[39%] w-48 rotate-[1deg] border border-espresso/10 bg-petal/55 px-5 py-4 shadow-lg">
        <div className="hand text-2xl text-espresso">today:</div>
        <div className="mt-2 space-y-1 font-serif text-sm text-espresso">
          <div>□ study</div><div>□ read</div><div>□ create</div><div>□ be proud ♡</div>
        </div>
      </div>

      <div className="absolute right-[13%] top-[43%] rounded-full border-2 border-espresso/60 bg-paper/75 px-5 py-4 text-center font-serif text-sm text-espresso shadow-sm">
        This looks<br />amazing! ♡
      </div>

      <div className="absolute left-[38%] bottom-[9%] w-36 rotate-[-4deg] border border-espresso/10 bg-paper/90 px-5 py-4 text-center shadow-md">
        <div className="hand text-xl text-espresso">better<br />things<br />take time ♡</div>
      </div>

      <div className="absolute right-[30%] bottom-[5%] h-32 w-[210px] rotate-[4deg] border-[7px] border-paper bg-paper p-1 shadow-xl">
        <div className="h-full rounded-sm bg-gradient-to-br from-sky/80 via-forest/45 to-sage/70" />
      </div>
      <div className="absolute right-[5%] bottom-[8%] w-48 rotate-[-5deg] border border-espresso/10 bg-amber/30 px-4 py-4 text-center shadow-md">
        <div className="hand text-lg text-espresso">“A little progress each day<br />adds up to big results.”</div>
      </div>

      <div className="absolute left-[1%] bottom-[0%] h-28 w-56 rotate-[2deg] rounded-t-[45%] bg-rose/20" />
      <div className="absolute left-[18%] top-[55%] text-4xl text-espresso/70">♡</div>
      <div className="absolute right-[28%] top-[27%] text-4xl text-espresso/70">♡</div>
      <div className="absolute right-[9%] top-[37%] text-4xl text-espresso/70">♡</div>
      <div className="absolute left-[41%] bottom-[27%] text-4xl text-espresso/65">✦</div>
    </div>
  );
}

function CanvasToolbar({ tool, setTool, undo, redo }: { tool: typeof defaultToolState; setTool: (id: string) => void; undo: () => void; redo: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-espresso/10 bg-paper/90 px-4">
      <button onClick={undo} title="Undo" className="toolbar-button"><Undo2 /></button>
      <button onClick={redo} title="Redo" className="toolbar-button"><Redo2 /></button>
      <span className="mx-2 h-5 w-px bg-espresso/10" />
      <button className="toolbar-select">100% <ChevronDown /></button>
      <span className="mx-1 h-5 w-px bg-espresso/10" />
      <button title="Pan" className="toolbar-button"><Hand /></button>
      {toolbar.map((item) => {
        const Icon = item.icon;
        const active = tool.tool === item.id;
        return <button key={item.id} title={item.label} onClick={() => setTool(item.id)} className={cn("toolbar-button", active && "bg-rose/30 text-espresso") }><Icon /></button>;
      })}
      <button title="Image" className="toolbar-button"><ImageIcon /></button>
      <button title="More" className="toolbar-button"><MoreHorizontal /></button>
    </div>
  );
}

function StickerDrawer({ tool, setTool }: { tool: typeof defaultToolState; setTool: (id: string) => void }) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STICKERS.filter((s) => (activeCat === "all" || s.cat === activeCat) && (!q || s.label.toLowerCase().includes(q)));
  }, [activeCat, query]);

  return (
    <aside className="hidden w-[330px] shrink-0 border-l border-espresso/10 bg-paper/80 lg:flex lg:flex-col">
      <div className="flex h-12 shrink-0 border-b border-espresso/10">
        {[
          ["stickers", "Stickers"],
          ["images", "Images"],
          ["shapes", "Shapes"],
        ].map(([id, label]) => <button key={id} className={cn("relative flex-1 text-xs font-medium text-room-ink/55", id === "stickers" && "text-espresso")}>{label}{id === "stickers" && <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-rose" />}</button>)}
      </div>

      <div className="border-b border-espresso/8 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-espresso/10 bg-paper px-3 py-2 text-room-ink/40 shadow-sm">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stickers..." className="min-w-0 flex-1 bg-transparent text-xs text-espresso outline-none placeholder:text-room-ink/35" />
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {[{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label.replace("emotional damage", "Emotions").replace("reading reactions", "Reactions").replace("marginalia", "Marks").replace("scrapy's little things", "Scrapy").replace("botanical", "Botanical").replace("chaotic little marks", "Chaotic").replace("scrapbook stuff", "Scrapbook Stuff") }))].map((c) => <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn("whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] transition", activeCat === c.id ? "border-rose/40 bg-rose/20 text-espresso" : "border-espresso/10 text-room-ink/50 hover:bg-paper-deep")}>{c.label}</button>)}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="hand text-xl text-espresso">little things</h3><span className="text-[10px] text-room-ink/40">{filtered.length} stickers</span></div>
        <div className="grid grid-cols-4 gap-2">
          {filtered.map((s) => <button key={s.id} title={s.label} onClick={() => { pickSticker(s.id); setTool("sticker"); }} className={cn("grid min-h-[68px] place-items-center rounded-xl border border-transparent bg-paper-deep/45 p-2 transition hover:-translate-y-0.5 hover:border-rose/30 hover:bg-rose/10", tool.stickerId === s.id && "border-rose/50 bg-rose/15 ring-1 ring-rose/20")}><StickerArt id={s.id} size={Math.min(48, s.size)} /></button>)}
        </div>
      </div>
    </aside>
  );
}

function NotePageView() {
  const { noteId } = Route.useParams();
  const note = useScrap((s) => s.notes.find((n) => n.id === noteId));
  const [pageIdx, setPageIdx] = useState(0);
  const [tool, setToolState] = useState(defaultToolState);
  const mood = useTimeMood("curious");
  const page = note?.pages[Math.min(pageIdx, (note?.pages.length ?? 1) - 1)];

  const setItems = (items: CanvasItem[]) => { if (note && page) actions.setPage(note.id, page.id, { items }); };
  const history = useCanvasHistory(page?.items ?? [], setItems);
  const setTool = (id: string) => setToolState((s) => ({ ...s, tool: id as typeof s.tool }));

  if (!note || !page) return <div className="grid h-full place-items-center"><div className="paper-card p-8 text-center"><p className="hand text-3xl text-espresso">this page isn't here</p><Link to="/" className="hand mt-3 inline-block underline">back to the shelf</Link></div></div>;

  return (
    <div className="flex h-full min-h-0 flex-col bg-paper">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-espresso/10 bg-paper px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" aria-label="Back" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-paper-deep"><ArrowLeft className="h-4 w-4" /></Link>
          <input value={note.title} onChange={(e) => actions.updateNote(note.id, { title: e.target.value })} className="min-w-0 max-w-[260px] bg-transparent text-sm font-medium text-espresso outline-none" />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-room-ink/45"><span className="hidden sm:inline">Canvas</span><span>•</span><span>Saved</span></div>
      </div>

      <div className="min-h-0 flex flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <CanvasToolbar tool={tool} setTool={setTool} undo={history.undo} redo={history.redo} />
          <div className="min-h-0 flex-1 overflow-hidden bg-paper-deep/45 p-2 md:p-3">
            <ScrapCanvas items={page.items} onChange={setItems} toolState={tool} history={history} className="paper-card paper-grain relative h-full min-h-0 overflow-hidden rounded-[18px] border border-espresso/10 p-3 shadow-[0_14px_45px_rgba(83,64,45,0.14)] md:p-4">
              <DecorativePaper />
              <textarea value={page.text} onChange={(e) => actions.setPage(note.id, page.id, { text: e.target.value })} placeholder="start writing..." onPointerDown={(e) => tool.tool === "select" && e.stopPropagation()} style={{ pointerEvents: tool.tool === "select" ? "auto" : "none", position: "relative", zIndex: 2 }} className="hand relative min-h-full w-full resize-none bg-transparent pr-[8%] text-[1.1rem] leading-8 text-espresso outline-none placeholder:text-room-ink/30 md:text-[1.2rem]" />
            </ScrapCanvas>
          </div>

          <div className="flex h-11 shrink-0 items-center justify-between border-t border-espresso/10 bg-paper px-4 text-[11px] text-room-ink/55">
            <div className="flex items-center gap-2"><button disabled={pageIdx === 0} onClick={() => setPageIdx((i) => Math.max(0, i - 1))} className="grid h-7 w-7 place-items-center rounded-md hover:bg-paper-deep disabled:opacity-25"><ArrowLeft className="h-3.5 w-3.5" /></button><span>Page {pageIdx + 1} / {note.pages.length}</span><button disabled={pageIdx >= note.pages.length - 1} onClick={() => setPageIdx((i) => Math.min(note.pages.length - 1, i + 1))} className="grid h-7 w-7 place-items-center rounded-md hover:bg-paper-deep disabled:opacity-25"><ArrowRight className="h-3.5 w-3.5" /></button></div>
            <div className="flex items-center gap-1.5"><span className="mr-2 hidden sm:inline">Saved</span><button onClick={() => page.items.length && actions.setPage(note.id, page.id, { items: [...page.items, ...page.items.slice(-1).map((x) => ({ ...x, id: `${x.id}-copy-${Date.now()}` } as CanvasItem))] })} title="Duplicate" className="grid h-7 w-7 place-items-center rounded-md hover:bg-paper-deep"><Copy className="h-3.5 w-3.5" /></button><button title="Layers" className="grid h-7 w-7 place-items-center rounded-md hover:bg-paper-deep"><Layers3 className="h-3.5 w-3.5" /></button><button onClick={() => history.undo()} title="Delete last" className="grid h-7 w-7 place-items-center rounded-md hover:bg-paper-deep"><Trash2 className="h-3.5 w-3.5" /></button></div>
          </div>
        </div>

        <StickerDrawer tool={tool} setTool={setTool} />
      </div>

      <ScrapyHere room="notes" mood={mood} ctx={{ tool: tool.tool, stickerId: tool.stickerId, items: page.items.length, page: pageIdx + 1, pageCount: note.pages.length, docName: note.title }} prop={tool.tool === "highlighter" ? "highlighter" : tool.tool === "pen" ? "pen" : tool.tool === "sticker" ? "sticker" : "mug"} size={54} spots={["bottom-16 right-5", "top-20 right-3"]} />
    </div>
  );
}
