import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { ScrapCanvas, useCanvasHistory } from "@/components/scrap-canvas";
import { ToolBelt, defaultToolState } from "@/components/tool-belt";
import { ScrapyHere, useTimeMood } from "@/components/scrapy";
import { actions, useScrap, type CanvasItem } from "@/lib/scrap-store";

export const Route = createFileRoute("/notes/$noteId")({
  head: () => ({
    meta: [
      { title: "Notebook — Scrap" },
      {
        name: "description",
        content: "Write, doodle, highlight and stick things onto a warm paper page.",
      },
      { property: "og:title", content: "Notebook — Scrap" },
      { property: "og:description", content: "A warm paper page you can write and doodle on." },
    ],
  }),
  component: NotePageView,
});

function NotePageView() {
  const { noteId } = Route.useParams();
  const note = useScrap((s) => s.notes.find((n) => n.id === noteId));
  const [pageIdx, setPageIdx] = useState(0);
  const [tool, setTool] = useState(defaultToolState);
  const mood = useTimeMood("curious");

  const page = note?.pages[Math.min(pageIdx, (note?.pages.length ?? 1) - 1)];

  const setItems = (items: CanvasItem[]) => {
    if (!note || !page) return;
    actions.setPage(note.id, page.id, { items });
  };
  const history = useCanvasHistory(page?.items ?? [], setItems);

  if (!note || !page) {
    return (
      <div className="paper-card paper-grain mx-auto mt-20 max-w-sm -rotate-1 p-8 text-center">
        <p className="hand text-3xl text-espresso">this page isn't here</p>
        <Link to="/" className="hand mt-3 inline-block text-xl underline decoration-wavy">
          back to the shelf
        </Link>
      </div>
    );
  }

  const tapes = [
    { id: "petal", v: "var(--petal)" },
    { id: "sage", v: "var(--sage)" },
    { id: "sky", v: "var(--sky)" },
    { id: "amber", v: "var(--amber)" },
    { id: "rose", v: "var(--rose)" },
  ];

  return (
    <div className="relative pb-2">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-espresso"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} /> shelf
        </Link>
        <input
          value={note.title}
          onChange={(e) => actions.updateNote(note.id, { title: e.target.value })}
          className="hand min-w-0 flex-1 bg-transparent text-[1.75rem] leading-none text-espresso outline-none placeholder:text-muted-foreground md:text-4xl"
          placeholder="untitled page"
        />
        <div className="flex items-center gap-1" title="tape colour">
          {tapes.map((t) => (
            <button
              key={t.id}
              onClick={() => actions.updateNote(note.id, { tape: t.v })}
              className={`h-5 w-7 -rotate-3 rounded-[2px] transition-transform hover:-translate-y-0.5 ${
                note.tape === t.v ? "ring-1 ring-espresso" : ""
              }`}
              style={{ background: t.v }}
              aria-label={`${t.id} tape`}
            />
          ))}
        </div>
      </div>


      <ScrapCanvas
        items={page.items}
        onChange={setItems}
        toolState={tool}
        history={history}
        className="paper-card paper-grain ruled-lines mx-auto min-h-[50vh] max-w-2xl p-4 md:min-h-[56vh] md:p-6"
      >
        <textarea
          value={page.text}
          onChange={(e) => actions.setPage(note.id, page.id, { text: e.target.value })}
          placeholder="start writing…"
          onPointerDown={(e) => tool.tool === "select" && e.stopPropagation()}
          style={{ pointerEvents: tool.tool === "select" ? "auto" : "none" }}
          className="hand min-h-[44vh] w-full resize-none bg-transparent text-[1.25rem] leading-[1.85rem] text-espresso outline-none placeholder:text-muted-foreground md:min-h-[50vh] md:text-[1.4rem] md:leading-[2rem]"
        />
      </ScrapCanvas>

      <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center gap-1.5 md:gap-2">
        {note.pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPageIdx(i)}
            className={`hand rounded-[3px] px-2 py-0.5 text-base transition-colors md:text-lg ${
              i === pageIdx ? "bg-secondary text-espresso" : "text-muted-foreground hover:text-espresso"
            }`}
          >
            page {i + 1}
          </button>
        ))}
        <button
          onClick={() => {
            actions.addPage(note.id);
            setPageIdx(note.pages.length);
          }}
          className="hand flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-base text-muted-foreground hover:text-espresso md:text-lg"
        >
          <Plus className="h-3.5 w-3.5" /> add page
        </button>
      </div>

      {/* toolbar docked to the bottom edge of the working area */}
      <div className="sticky bottom-0 z-30 -mx-1 mt-3 w-fit max-w-full px-1 pb-1">
        <ToolBelt state={tool} onChange={setTool} onUndo={history.undo} onRedo={history.redo} />
      </div>

      <ScrapyHere
        room="notes"
        mood={mood}
        prop={tool.tool === "highlighter" ? "highlighter" : tool.tool === "pen" ? "pen" : "mug"}
        size={56}
        lines={[
          "try the highlighter — it straightens itself out.",
          "i'll just sit here while you write.",
          "the margins are yours too.",
        ]}
        spots={["top-24 right-2 lg:-right-6", "bottom-24 left-2 lg:-left-8", "top-1/2 right-2 lg:-right-8"]}
      />
    </div>
  );
}
